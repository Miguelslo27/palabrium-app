/**
 * Tests for mongodb connection module
 * 
 * This module manages MongoDB connection using mongoose with a global cache
 * to prevent multiple connections in serverless environments.
 */

// Mock mongoose before importing
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('mongodb', () => {
  let dbConnectModule: any;
  let mongoose: any;
  let mockConnect: jest.Mock;

  // Store original env
  const originalEnv = process.env.MONGODB_URI;

  beforeEach(() => {
    // Clear module cache to test fresh imports
    jest.resetModules();

    // Clear global mongoose cache
    const globalWithMongoose = global as typeof globalThis & {
      mongoose?: { conn: any; promise: any };
    };
    delete globalWithMongoose.mongoose;

    // Get mocked mongoose
    mongoose = require('mongoose');
    mockConnect = mongoose.connect as jest.Mock;

    // Setup default successful connection
    mockConnect.mockResolvedValue(mongoose);
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.MONGODB_URI = originalEnv;
    } else {
      delete process.env.MONGODB_URI;
    }

    jest.clearAllMocks();
  });

  describe('environment variable validation', () => {
    it('should throw error if MONGODB_URI is not defined', () => {
      // Arrange
      delete process.env.MONGODB_URI;

      // Act & Assert
      expect(() => {
        require('@/lib/mongodb');
      }).toThrow('Please define the MONGODB_URI environment variable inside .env.local');
    });

    it('should throw error if MONGODB_URI is empty string', () => {
      // Arrange
      process.env.MONGODB_URI = '';

      // Act & Assert
      expect(() => {
        require('@/lib/mongodb');
      }).toThrow('Please define the MONGODB_URI environment variable inside .env.local');
    });

    it('should not throw error if MONGODB_URI is defined', () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      expect(() => {
        require('@/lib/mongodb');
      }).not.toThrow();
    });
  });

  describe('dbConnect', () => {
    beforeEach(() => {
      // Set valid MONGODB_URI for connection tests
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    });

    describe('first connection', () => {
      it('should connect to MongoDB with correct URI', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(
          'mongodb://localhost:27017/test',
          { bufferCommands: false }
        );
      });

      it('should connect to MongoDB only once', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledTimes(1);
      });

      it('should return mongoose instance', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act
        const result = await dbConnectModule.default();

        // Assert
        expect(result).toBe(mongoose);
      });

      it('should cache the connection in global object', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');
        const globalWithMongoose = global as typeof globalThis & {
          mongoose: { conn: any; promise: any };
        };

        // Act
        await dbConnectModule.default();

        // Assert
        expect(globalWithMongoose.mongoose.conn).toBe(mongoose);
        expect(globalWithMongoose.mongoose.promise).toBeDefined();
      });
    });

    describe('cached connection', () => {
      it('should reuse cached connection on subsequent calls', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act - Call multiple times
        const result1 = await dbConnectModule.default();
        const result2 = await dbConnectModule.default();
        const result3 = await dbConnectModule.default();

        // Assert - Should only connect once
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });

      it('should return cached connection immediately if available', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');
        await dbConnectModule.default(); // First connection

        // Act - Second call should be instant (from cache)
        const start = Date.now();
        const result = await dbConnectModule.default();
        const duration = Date.now() - start;

        // Assert
        expect(result).toBe(mongoose);
        expect(duration).toBeLessThan(10); // Should be instant from cache
      });

      it('should handle concurrent connection attempts', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act - Multiple concurrent calls
        const promises = [
          dbConnectModule.default(),
          dbConnectModule.default(),
          dbConnectModule.default(),
        ];
        const results = await Promise.all(promises);

        // Assert - Should only connect once despite concurrent calls
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(results[0]).toBe(results[1]);
        expect(results[1]).toBe(results[2]);
      });
    });

    describe('error handling', () => {
      it('should throw error if connection fails', async () => {
        // Arrange
        const connectionError = new Error('Connection refused');
        mockConnect.mockRejectedValue(connectionError);
        dbConnectModule = require('@/lib/mongodb');

        // Act & Assert
        await expect(dbConnectModule.default()).rejects.toThrow('Connection refused');
      });

      it('should clear promise cache on connection error', async () => {
        // Arrange
        const connectionError = new Error('Network error');
        mockConnect.mockRejectedValueOnce(connectionError).mockResolvedValueOnce(mongoose);
        dbConnectModule = require('@/lib/mongodb');

        // Act - First call fails
        await expect(dbConnectModule.default()).rejects.toThrow('Network error');

        // Second call should retry (promise was cleared)
        const result = await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledTimes(2);
        expect(result).toBe(mongoose);
      });

      it('should not cache connection on error', async () => {
        // Arrange
        const connectionError = new Error('Auth failed');
        mockConnect.mockRejectedValue(connectionError);
        dbConnectModule = require('@/lib/mongodb');
        const globalWithMongoose = global as typeof globalThis & {
          mongoose?: { conn: any; promise: any };
        };

        // Act
        try {
          await dbConnectModule.default();
        } catch (e) {
          // Expected to throw
        }

        // Assert - Promise should be cleared, conn should remain null
        expect(globalWithMongoose.mongoose!.conn).toBeNull();
        expect(globalWithMongoose.mongoose!.promise).toBeNull();
      });

      it('should propagate connection errors', async () => {
        // Arrange
        const customError = new Error('Custom connection error');
        mockConnect.mockRejectedValue(customError);
        dbConnectModule = require('@/lib/mongodb');

        // Act & Assert
        await expect(dbConnectModule.default()).rejects.toBe(customError);
      });
    });

    describe('connection options', () => {
      it('should use bufferCommands: false option', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ bufferCommands: false })
        );
      });

      it('should only pass bufferCommands option', async () => {
        // Arrange
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        const callOptions = mockConnect.mock.calls[0][1];
        expect(Object.keys(callOptions)).toEqual(['bufferCommands']);
      });
    });

    describe('global cache initialization', () => {
      it('should initialize global cache if not exists', () => {
        // Arrange
        const globalWithMongoose = global as typeof globalThis & {
          mongoose?: { conn: any; promise: any };
        };
        delete globalWithMongoose.mongoose;

        // Act
        dbConnectModule = require('@/lib/mongodb');

        // Assert
        expect(globalWithMongoose.mongoose).toBeDefined();
        expect(globalWithMongoose.mongoose!.conn).toBeNull();
        expect(globalWithMongoose.mongoose!.promise).toBeNull();
      });

      it('should reuse existing global cache', () => {
        // Arrange
        const existingCache = { conn: mongoose, promise: Promise.resolve(mongoose) };
        const globalWithMongoose = global as typeof globalThis & {
          mongoose: { conn: any; promise: any };
        };
        globalWithMongoose.mongoose = existingCache;

        // Act
        dbConnectModule = require('@/lib/mongodb');

        // Assert - Should use existing cache, not create new one
        expect(globalWithMongoose.mongoose).toBe(existingCache);
      });
    });

    describe('different MongoDB URIs', () => {
      it('should work with localhost URI', async () => {
        // Arrange
        process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(
          'mongodb://localhost:27017/testdb',
          expect.any(Object)
        );
      });

      it('should work with MongoDB Atlas URI', async () => {
        // Arrange
        const atlasUri = 'mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true';
        process.env.MONGODB_URI = atlasUri;
        jest.resetModules();
        // Re-get mocked mongoose after resetModules
        mongoose = require('mongoose');
        mockConnect = mongoose.connect as jest.Mock;
        mockConnect.mockResolvedValue(mongoose);
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(atlasUri, expect.any(Object));
      });

      it('should work with authenticated URI', async () => {
        // Arrange
        const authUri = 'mongodb://admin:password123@localhost:27017/admin';
        process.env.MONGODB_URI = authUri;
        jest.resetModules();
        // Re-get mocked mongoose after resetModules
        mongoose = require('mongoose');
        mockConnect = mongoose.connect as jest.Mock;
        mockConnect.mockResolvedValue(mongoose);
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(authUri, expect.any(Object));
      });

      it('should work with replica set URI', async () => {
        // Arrange
        const replicaUri = 'mongodb://host1:27017,host2:27017,host3:27017/db?replicaSet=rs0';
        process.env.MONGODB_URI = replicaUri;
        jest.resetModules();
        // Re-get mocked mongoose after resetModules
        mongoose = require('mongoose');
        mockConnect = mongoose.connect as jest.Mock;
        mockConnect.mockResolvedValue(mongoose);
        dbConnectModule = require('@/lib/mongodb');

        // Act
        await dbConnectModule.default();

        // Assert
        expect(mockConnect).toHaveBeenCalledWith(replicaUri, expect.any(Object));
      });
    });
  });

  describe('default export', () => {
    it('should export dbConnect as default', () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      dbConnectModule = require('@/lib/mongodb');

      // Assert
      expect(dbConnectModule.default).toBeDefined();
      expect(typeof dbConnectModule.default).toBe('function');
    });
  });

  describe('serverless environment simulation', () => {
    it('should handle multiple serverless function invocations', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act - Simulate first serverless invocation
      jest.resetModules();
      mongoose = require('mongoose');
      const firstConnect = mongoose.connect as jest.Mock;
      firstConnect.mockResolvedValue(mongoose);
      let module1 = require('@/lib/mongodb');
      const result1 = await module1.default();

      // Second invocation (module cache cleared but global cache persists)
      jest.resetModules();
      mongoose = require('mongoose');
      const secondConnect = mongoose.connect as jest.Mock;
      secondConnect.mockResolvedValue(mongoose);
      let module2 = require('@/lib/mongodb');
      const result2 = await module2.default();

      // Assert - First call should connect, second should use cache
      expect(firstConnect).toHaveBeenCalledTimes(1);
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should prevent connection leaks in serverless', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      dbConnectModule = require('@/lib/mongodb');

      // Act - Multiple calls simulating serverless requests
      for (let i = 0; i < 10; i++) {
        await dbConnectModule.default();
      }

      // Assert - Should only create one connection despite multiple calls
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle mongoose.connect returning different instance', async () => {
      // Arrange
      const differentMongoose = { ...mongoose, custom: 'property' };
      mockConnect.mockResolvedValue(differentMongoose);
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      dbConnectModule = require('@/lib/mongodb');

      // Act
      const result = await dbConnectModule.default();

      // Assert
      expect(result).toBe(differentMongoose);
    });

    it('should handle extremely long URI', async () => {
      // Arrange
      const longUri = 'mongodb://localhost:27017/' + 'a'.repeat(1000);
      process.env.MONGODB_URI = longUri;
      jest.resetModules();
      // Re-get mocked mongoose after resetModules
      mongoose = require('mongoose');
      mockConnect = mongoose.connect as jest.Mock;
      mockConnect.mockResolvedValue(mongoose);
      dbConnectModule = require('@/lib/mongodb');

      // Act
      await dbConnectModule.default();

      // Assert
      expect(mockConnect).toHaveBeenCalledWith(longUri, expect.any(Object));
    });

    it('should handle URI with special characters', async () => {
      // Arrange
      const specialUri = 'mongodb://user%40email.com:p%40ssw0rd@localhost:27017/db';
      process.env.MONGODB_URI = specialUri;
      jest.resetModules();
      // Re-get mocked mongoose after resetModules
      mongoose = require('mongoose');
      mockConnect = mongoose.connect as jest.Mock;
      mockConnect.mockResolvedValue(mongoose);
      dbConnectModule = require('@/lib/mongodb');

      // Act
      await dbConnectModule.default();

      // Assert
      expect(mockConnect).toHaveBeenCalledWith(specialUri, expect.any(Object));
    });
  });
});

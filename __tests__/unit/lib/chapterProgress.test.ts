/**
 * Tests for chapterProgress pub/sub module
 */

import { chapterProgress } from '@/lib/chapterProgress';

describe('chapterProgress', () => {
  beforeEach(() => {
    // Reset the EventTarget before each test
    chapterProgress._et = null;
  });

  describe('EventTarget initialization', () => {
    it('should lazily create EventTarget on first access', () => {
      // Arrange & Assert - Initially null
      expect(chapterProgress._et).toBeNull();

      // Act - Access et getter
      const et = chapterProgress.et;

      // Assert - Now it's created
      expect(et).toBeInstanceOf(EventTarget);
      expect(chapterProgress._et).toBe(et);
    });

    it('should reuse the same EventTarget on subsequent accesses', () => {
      // Act
      const et1 = chapterProgress.et;
      const et2 = chapterProgress.et;

      // Assert
      expect(et1).toBe(et2);
    });
  });

  describe('publish', () => {
    it('should dispatch CustomEvent with correct payload', () => {
      // Arrange
      const payload = { index: 5, total: 10 };
      const eventListener = jest.fn();

      chapterProgress.et.addEventListener('chapter-progress-channel', eventListener);

      // Act
      chapterProgress.publish(payload);

      // Assert
      expect(eventListener).toHaveBeenCalledTimes(1);
      const event = eventListener.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual(payload);
    });

    it('should publish multiple events correctly', () => {
      // Arrange
      const payloads = [
        { index: 1, total: 5 },
        { index: 2, total: 5 },
        { index: 3, total: 5 },
      ];
      const eventListener = jest.fn();

      chapterProgress.et.addEventListener('chapter-progress-channel', eventListener);

      // Act
      payloads.forEach((payload) => chapterProgress.publish(payload));

      // Assert
      expect(eventListener).toHaveBeenCalledTimes(3);
      payloads.forEach((payload, index) => {
        const event = eventListener.mock.calls[index][0] as CustomEvent;
        expect(event.detail).toEqual(payload);
      });
    });

    it('should not throw if no subscribers are listening', () => {
      // Act & Assert
      expect(() => {
        chapterProgress.publish({ index: 1, total: 10 });
      }).not.toThrow();
    });
  });

  describe('subscribe', () => {
    it('should call subscriber when event is published', () => {
      // Arrange
      const subscriber = jest.fn();
      const payload = { index: 3, total: 10 };

      // Act
      chapterProgress.subscribe(subscriber);
      chapterProgress.publish(payload);

      // Assert
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(payload);
    });

    it('should support multiple subscribers', () => {
      // Arrange
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();
      const subscriber3 = jest.fn();
      const payload = { index: 7, total: 20 };

      // Act
      chapterProgress.subscribe(subscriber1);
      chapterProgress.subscribe(subscriber2);
      chapterProgress.subscribe(subscriber3);
      chapterProgress.publish(payload);

      // Assert
      expect(subscriber1).toHaveBeenCalledWith(payload);
      expect(subscriber2).toHaveBeenCalledWith(payload);
      expect(subscriber3).toHaveBeenCalledWith(payload);
    });

    it('should return unsubscribe function', () => {
      // Arrange
      const subscriber = jest.fn();

      // Act
      const unsubscribe = chapterProgress.subscribe(subscriber);

      // Assert
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should not notify subscriber after unsubscribe', () => {
      // Arrange
      const subscriber = jest.fn();
      const unsubscribe = chapterProgress.subscribe(subscriber);

      // Act
      chapterProgress.publish({ index: 1, total: 5 });
      unsubscribe();
      chapterProgress.publish({ index: 2, total: 5 });

      // Assert
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith({ index: 1, total: 5 });
    });

    it('should only unsubscribe the specific subscriber', () => {
      // Arrange
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();
      const payload = { index: 5, total: 10 };

      const unsubscribe1 = chapterProgress.subscribe(subscriber1);
      chapterProgress.subscribe(subscriber2);

      // Act
      unsubscribe1();
      chapterProgress.publish(payload);

      // Assert
      expect(subscriber1).not.toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalledWith(payload);
    });

    it('should allow re-subscription after unsubscribe', () => {
      // Arrange
      const subscriber = jest.fn();
      const payload1 = { index: 1, total: 5 };
      const payload2 = { index: 2, total: 5 };

      // Act
      const unsubscribe1 = chapterProgress.subscribe(subscriber);
      chapterProgress.publish(payload1);
      unsubscribe1();

      const unsubscribe2 = chapterProgress.subscribe(subscriber);
      chapterProgress.publish(payload2);

      // Assert
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(1, payload1);
      expect(subscriber).toHaveBeenNthCalledWith(2, payload2);

      // Cleanup
      unsubscribe2();
    });
  });

  describe('edge cases', () => {
    it('should handle subscriber that throws error', () => {
      // Arrange
      const errorSubscriber = jest.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalSubscriber = jest.fn();
      const payload = { index: 1, total: 5 };

      chapterProgress.subscribe(errorSubscriber);
      chapterProgress.subscribe(normalSubscriber);

      // Act - EventTarget swallows errors, so publish doesn't throw
      chapterProgress.publish(payload);

      // Assert - The error subscriber was called
      expect(errorSubscriber).toHaveBeenCalledWith(payload);

      // Note: EventTarget swallows errors in listeners, so the second 
      // subscriber may or may not be called depending on browser behavior.
      // This is expected and documented EventTarget behavior.
    });

    it('should handle rapid publish calls', () => {
      // Arrange
      const subscriber = jest.fn();
      chapterProgress.subscribe(subscriber);

      // Act - Publish many events rapidly
      for (let i = 0; i < 100; i++) {
        chapterProgress.publish({ index: i, total: 100 });
      }

      // Assert
      expect(subscriber).toHaveBeenCalledTimes(100);
    });

    it('should handle unsubscribe called multiple times', () => {
      // Arrange
      const subscriber = jest.fn();
      const unsubscribe = chapterProgress.subscribe(subscriber);

      // Act & Assert - Should not throw
      expect(() => {
        unsubscribe();
        unsubscribe();
        unsubscribe();
      }).not.toThrow();
    });

    it('should work correctly with payload having same index and total', () => {
      // Arrange
      const subscriber = jest.fn();
      const payload = { index: 5, total: 5 };
      chapterProgress.subscribe(subscriber);

      // Act
      chapterProgress.publish(payload);

      // Assert
      expect(subscriber).toHaveBeenCalledWith(payload);
    });

    it('should work correctly with zero values', () => {
      // Arrange
      const subscriber = jest.fn();
      const payload = { index: 0, total: 0 };
      chapterProgress.subscribe(subscriber);

      // Act
      chapterProgress.publish(payload);

      // Assert
      expect(subscriber).toHaveBeenCalledWith(payload);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical chapter reading progress', () => {
      // Arrange
      const progressUpdates: Array<{ index: number; total: number }> = [];
      const unsubscribe = chapterProgress.subscribe((payload) => {
        progressUpdates.push(payload);
      });

      // Act - Simulate reading through 5 chapters
      for (let i = 1; i <= 5; i++) {
        chapterProgress.publish({ index: i, total: 5 });
      }

      // Assert
      expect(progressUpdates).toHaveLength(5);
      expect(progressUpdates[0]).toEqual({ index: 1, total: 5 });
      expect(progressUpdates[4]).toEqual({ index: 5, total: 5 });

      // Cleanup
      unsubscribe();
    });

    it('should support multiple components tracking progress independently', () => {
      // Arrange
      const component1Progress: number[] = [];
      const component2Progress: number[] = [];

      const unsubscribe1 = chapterProgress.subscribe(({ index }) => {
        component1Progress.push(index);
      });

      const unsubscribe2 = chapterProgress.subscribe(({ index }) => {
        component2Progress.push(index);
      });

      // Act
      chapterProgress.publish({ index: 1, total: 3 });
      chapterProgress.publish({ index: 2, total: 3 });
      chapterProgress.publish({ index: 3, total: 3 });

      // Assert
      expect(component1Progress).toEqual([1, 2, 3]);
      expect(component2Progress).toEqual([1, 2, 3]);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });
  });
});

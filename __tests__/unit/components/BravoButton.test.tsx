import { render, screen, waitFor } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import BravoButton from '@/components/BravoButton';
import { toggleBravoAction } from '@/app/actions';

jest.mock('@/app/actions');

const mockToggleBravoAction = toggleBravoAction as jest.MockedFunction<typeof toggleBravoAction>;

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe('BravoButton', () => {
  beforeEach(() => {
    mockToggleBravoAction.mockReset();
  });

  it('renders bravo count when user is logged in', () => {
    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={[]}
        userId="user123"
      />
    );

    expect(screen.getByRole('button', { name: /Bravo \(10\)/ })).toBeInTheDocument();
  });

  it('renders braved state when user already reacted', () => {
    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={['user123']}
        userId="user123"
      />
    );

    const button = screen.getByRole('button', { name: /Bravos \(10\)/ });
    expect(button).toHaveClass('bg-yellow-500');
  });

  it('disables the button when the user is not logged in', () => {
    render(
      <BravoButton
        storyId="story1"
        initialBravos={5}
        userBravos={[]}
        userId={null}
      />
    );

    const button = screen.getByRole('button', { name: 'Bravo' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('calls toggleBravoAction and onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    mockToggleBravoAction.mockResolvedValue({ bravos: 11, braved: true });

    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={[]}
        userId="user123"
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole('button', { name: /Bravo \(10\)/ });
    await user.click(button);

    await waitFor(() => {
      expect(mockToggleBravoAction).toHaveBeenCalledWith('story1');
    });

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(11, true);
    });
  });

  it('shows optimistic feedback while the action is pending', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<{ bravos: number; braved: boolean }>();

    mockToggleBravoAction.mockImplementation(() => deferred.promise);

    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={[]}
        userId="user123"
      />
    );

    const button = screen.getByRole('button', { name: /Bravo \(10\)/ });
    await user.click(button);

    expect(button).toHaveTextContent('Bravos (11)');
    expect(button).toHaveClass('bg-yellow-500');

    deferred.resolve({ bravos: 11, braved: true });

    await waitFor(() => {
      expect(mockToggleBravoAction).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(button).toHaveTextContent('Bravo (10)');
    });
  });

  it('shows an alert and reverts optimistic update on error', async () => {
    const user = userEvent.setup();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockToggleBravoAction.mockRejectedValue(new Error('Network error'));

    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={[]}
        userId="user123"
      />
    );

    const button = screen.getByRole('button', { name: /Bravo \(10\)/ });
    await user.click(button);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error al enviar Bravo. Por favor intenta de nuevo.');
    });

    expect(button).toHaveTextContent('Bravo (10)');
    expect(mockToggleBravoAction).toHaveBeenCalledTimes(1);

    alertMock.mockRestore();
  });

  it('prevents duplicate submissions while pending', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<{ bravos: number; braved: boolean }>();

    mockToggleBravoAction.mockImplementation(() => deferred.promise);

    render(
      <BravoButton
        storyId="story1"
        initialBravos={10}
        userBravos={[]}
        userId="user123"
      />
    );

    const button = screen.getByRole('button', { name: /Bravo \(10\)/ });
    await user.click(button);
    await user.click(button);

    expect(mockToggleBravoAction).toHaveBeenCalledTimes(1);

    deferred.resolve({ bravos: 11, braved: true });
  });
});

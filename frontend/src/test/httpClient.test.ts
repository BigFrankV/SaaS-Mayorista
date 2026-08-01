import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockInstance, mockPost, mockSetTokens, mockClear, mockGetState } = vi.hoisted(
  () => {
    const mockSetTokens = vi.fn();
    const mockClear = vi.fn();
    const mockGetState = vi.fn();

    const mockInstance = Object.assign(
      vi.fn(() => Promise.resolve({ data: 'retry-success' })),
      {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        request: vi.fn(),
      },
    );

    const mockPost = vi.fn();

    return { mockInstance, mockPost, mockSetTokens, mockClear, mockGetState };
  },
);

vi.mock('axios', () => ({
  default: {
    create: () => mockInstance,
    post: mockPost,
  },
}));

vi.mock('../shared/store/authStore', () => ({
  useAuthStore: { getState: mockGetState },
}));

function stubLocation(pathname = '/app') {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { pathname, href: `http://localhost${pathname}`, assign },
  });
  return assign;
}

describe('httpClient interceptors', () => {
  let requestHandler: (config: any) => any;
  let responseErrorHandler: (error: any) => Promise<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    stubLocation();

    vi.resetModules();
    await import('../shared/api/httpClient');

    requestHandler = mockInstance.interceptors.request.use.mock.calls[0][0];
    responseErrorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('request interceptor', () => {
    it('adds Bearer token when accessToken exists', () => {
      mockGetState.mockReturnValue({
        accessToken: 'test-token',
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      const config = { headers: {} };
      const result = requestHandler(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('does not add Authorization when no token', () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      const config = { headers: {} };
      const result = requestHandler(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('refreshes token on 401 and retries original request', async () => {
      const originalRequest = { url: '/test', headers: {} };
      const error = { config: originalRequest, response: { status: 401 } };

      mockGetState.mockReturnValue({
        accessToken: 'old-access',
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      mockPost.mockResolvedValue({
        data: {
          accessToken: 'new-access',
          refreshToken: null,
          tokenType: 'Bearer',
          accessTokenExpiresIn: 3600,
        },
      });

      const result = await responseErrorHandler(error);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        {},
        { withCredentials: true },
      );
      expect(mockSetTokens).toHaveBeenCalledWith('new-access');
      expect(originalRequest).toHaveProperty('_retry', true);
      expect(result).toEqual({ data: 'retry-success' });
    });

    it('queues concurrent requests during refresh', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'token',
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      let resolveRefresh: (value: unknown) => void;
      mockPost.mockImplementation(
        () => new Promise((resolve) => { resolveRefresh = resolve; }),
      );

      const createError = () => ({
        config: { url: '/test', headers: {} },
        response: { status: 401 },
      });

      const promise1 = responseErrorHandler(createError());
      const promise2 = responseErrorHandler(createError());
      const promise3 = responseErrorHandler(createError());

      resolveRefresh!({
        data: {
          accessToken: 'new-access',
          refreshToken: null,
          tokenType: 'Bearer',
          accessTokenExpiresIn: 3600,
        },
      });

      const results = await Promise.all([promise1, promise2, promise3]);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockSetTokens).toHaveBeenCalledWith('new-access');
      expect(results).toHaveLength(3);
      for (const r of results) {
        expect(r).toEqual({ data: 'retry-success' });
      }
    });

    it('clears tokens and redirects to /login when refresh fails', async () => {
      const originalRequest = { url: '/test', headers: {} };
      const error = { config: originalRequest, response: { status: 401 } };

      mockGetState.mockReturnValue({
        accessToken: 'old-access',
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      const refreshError = new Error('Refresh failed');
      mockPost.mockRejectedValue(refreshError);

      await expect(responseErrorHandler(error)).rejects.toBe(refreshError);
      expect(mockClear).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith('/login');
    });

    it('passes through non-401 errors', async () => {
      const originalRequest = { url: '/test', headers: {} };
      const error = { config: originalRequest, response: { status: 403 } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockClear).not.toHaveBeenCalled();
    });

    it('clears tokens and redirects when no accessToken available on 401', async () => {
      const originalRequest = { url: '/test', headers: {} };
      const error = { config: originalRequest, response: { status: 401 } };

      mockGetState.mockReturnValue({
        accessToken: null,
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(mockClear).toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith('/login');
    });

    it('does not redirect when already on /login', async () => {
      stubLocation('/login');
      const originalRequest = { url: '/test', headers: {} };
      const error = { config: originalRequest, response: { status: 401 } };

      mockGetState.mockReturnValue({
        accessToken: 'old-access',
        setTokens: mockSetTokens,
        clear: mockClear,
      });

      const refreshError = new Error('Refresh failed');
      mockPost.mockRejectedValue(refreshError);

      await expect(responseErrorHandler(error)).rejects.toBe(refreshError);
      expect(mockClear).toHaveBeenCalled();
      expect(window.location.assign).not.toHaveBeenCalled();
    });
  });
});

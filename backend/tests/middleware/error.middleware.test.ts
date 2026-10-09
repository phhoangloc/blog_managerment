import { errorHandler } from '../../src/middleware/error.middleware';
import { AppError } from '../../src/utils/AppError';

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('errorHandler', () => {
  it('maps AppError to its status', () => {
    const res = mockRes();
    errorHandler(new AppError(404, 'nope'), {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'nope' });
  });

  it('hides unknown errors behind a 500', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = mockRes();
    errorHandler(new Error('secret detail'), {} as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

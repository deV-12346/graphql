declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        sid: string;
        tokenVersion: number;
      };
    }
  }
}

export {};
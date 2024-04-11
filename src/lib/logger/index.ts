import pino, { Logger, LoggerOptions } from "pino";

type LoggerParams = {
  serviceName: string;
  enabled?: boolean;
};

export const logger = ({
  serviceName,
  enabled = true,
}: LoggerParams): Logger => {
  const options: LoggerOptions = {
    timestamp: pino.stdTimeFunctions.isoTime,
    customLevels: {
      trace: 100,
      debug: 100,
      info: 200,
      warn: 400,
      error: 500,
      fatal: 600,
    },
    redact: [
      "token",
      "access_token",
      "password",
      "req.body.password",
      "req.body.token",
      "req.headers.authorization",
      "req.headers.Authorization",
    ],
    useOnlyCustomLevels: true,
    name: serviceName,
    enabled,
  };

  const log = pino(options);
  return log;
};

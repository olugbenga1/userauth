import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface IResponseMsg {
  statusCode: number;
  message: string[] | string;
  error: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;
    const exceptionResponse = exception.getResponse() as any;

    const responseMsg: IResponseMsg = exception.getResponse() as IResponseMsg;

    if (status === HttpStatus.BAD_REQUEST && exceptionResponse.message) {
      const errors = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.map((error) => {
            const [field, message] = error.split(':');
            return { field: field.trim(), message: message.trim() };
          })
        : [{ field: 'unknown', message: exceptionResponse.message }];

      const errorFieldCount = errors?.filter(
        (error) => error?.field !== 'unknown',
      ).length;

      response
        .status(errorFieldCount ? HttpStatus.UNPROCESSABLE_ENTITY : status)
        .json({
          status: 'Bad Request',
          ...(errorFieldCount ? { errors } : {}),
          message: Array.isArray(responseMsg.message)
            ? responseMsg.message[0]
            : message,
          statusCode: errorFieldCount ? 422 : status,
        });
    } else {
      response.status(status).json({
        status: 'Bad Request',
        // data: exception.getResponse(),
        message: Array.isArray(responseMsg.message)
          ? responseMsg.message[0]
          : message,
        statusCode: status,
      });
    }
  }
}

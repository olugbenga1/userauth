import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const validationErrors = exception.getResponse() as {
      message: ValidationError[];
    };

    const errors = validationErrors.message.map((error) => ({
      field: error.property,
      message: Object?.values(error?.constraints)[0],
    }));

    response.status(422).json({
      errors,
    });
  }
}

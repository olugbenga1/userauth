import { BadRequestException, ValidationError } from '@nestjs/common';

export const customExceptionFactory = (errors: ValidationError[]) => {
  const formattedErrors = errors.map((error) => {
    return {
      field: error.property,
      message: Object.values(error.constraints).join(', '),
    };
  });

  return new BadRequestException({
    status: 'Bad Request',
    errors: formattedErrors,
    message: formattedErrors
      .map((err) => `${err.field}: ${err.message}`)
      .join(', '),
    statusCode: 422,
  });
};

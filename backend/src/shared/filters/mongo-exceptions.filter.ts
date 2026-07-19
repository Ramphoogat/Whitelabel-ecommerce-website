import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch(MongooseError.CastError, MongooseError.ValidationError)
export class MongoExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let message = 'Invalid request data';

    if (exception instanceof MongooseError.CastError) {
      message = `Invalid value for field "${exception.path}"`;
    } else if (exception instanceof MongooseError.ValidationError) {
      message = Object.values(exception.errors)
        .map((e: any) => e.message)
        .join(', ');
    } else if (exception?.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      const field = Object.keys(exception.keyValue || {})[0];
      message = `Duplicate value for field "${field}"`;
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

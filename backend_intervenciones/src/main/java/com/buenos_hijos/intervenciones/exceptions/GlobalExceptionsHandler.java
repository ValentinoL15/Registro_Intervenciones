package com.buenos_hijos.intervenciones.exceptions;

import com.buenos_hijos.intervenciones.dto.ErrorResponse;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionsHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse error = new ErrorResponse(
                "Ocurrió un error inesperado: " + ex.getMessage(),
                status.value(),
                status.getReasonPhrase(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException message,
                                                                     WebRequest request) {
        HttpStatus httpStatus = HttpStatus.FORBIDDEN;

        ErrorResponse error = new ErrorResponse(
                message.getMessage(),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                request.getDescription(false)
        );

        return new ResponseEntity<>(error,httpStatus);
    }




}

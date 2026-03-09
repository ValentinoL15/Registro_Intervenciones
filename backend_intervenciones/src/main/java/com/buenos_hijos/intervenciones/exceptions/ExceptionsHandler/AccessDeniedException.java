package com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler;

public class AccessDeniedException extends RuntimeException{

    private static final String DEFAULT_MESSAGE = "No tienes permiso para realizar esta acción o acceder a este recurso.";

    public AccessDeniedException(String message) {
        super(message);
    }

    public AccessDeniedException(String message,Throwable cause) {
        super(message,cause);
    }

    public AccessDeniedException(Throwable cause) {
        super(DEFAULT_MESSAGE,cause);
    }

    public AccessDeniedException() {
        super(DEFAULT_MESSAGE);
    }

}

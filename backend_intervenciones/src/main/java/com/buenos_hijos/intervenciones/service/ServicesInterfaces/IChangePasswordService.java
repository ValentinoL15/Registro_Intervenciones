package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;

public interface IChangePasswordService {

    public GeneralResponse forgotPassword(String email);

    public GeneralResponse changePassword(String token, String password);

    public String encryptPassword(String password);

}

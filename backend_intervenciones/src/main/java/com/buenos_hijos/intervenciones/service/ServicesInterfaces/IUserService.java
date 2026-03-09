package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.UserDTOs.EditUserDto;

import java.util.Map;

public interface IUserService {

    public Map<String, String> editUser(EditUserDto userDto, String currentUser);

}

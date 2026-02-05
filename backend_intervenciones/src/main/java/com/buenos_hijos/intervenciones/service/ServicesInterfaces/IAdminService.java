package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdminService {

    public AdminDto getAdmin(Long user_id);

    public Page<AdminDto> getAllAdmins(Pageable pageable);

    public GeneralResponse saveAdmin(CreateAdminDto adminDto);

    public GeneralResponse editAdmin(EditAdminDto adminDto);

    public GeneralResponse deleteAdmin(Long user_id);

}

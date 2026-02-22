package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdminService {

    public AdminDto getAdmin(Long userId);

    public Page<AdminDto> getAllAdmins(Pageable pageable);

    public GeneralResponse saveAdmin(CreateAdminDto adminDto);

    public GeneralResponse saveProfesional(CreateProfesionalDto profesionalDto, String currentUser);

    public GeneralResponse saveCocinero(SaveCocineroDto cocineroDto, String currentUser);

    public GeneralResponse saveNutricionista(SaveNutricionistaDto nutricionistaDto, String currentUser);

    public GeneralResponse editAdmin(EditAdminDto adminDto, String currentUser);

    public GeneralResponse deleteAdmin(String currentUser, Long adminId);

    public GeneralResponse deleteProfesional(String currentUser, Long profesionalId);

    public GeneralResponse altaBajaProfesional(Long profesionalId, String currentUser);

    public GeneralResponse altaBajaCocinero(Long cocineroId, String currentUser);

    public GeneralResponse deleteCocinero(Long cocineroId, String currentUser);

    public GeneralResponse deleteNutricionista(Long nutricionistaId, String currentUser);

    public String encryptPassword(String password);

}

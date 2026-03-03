package com.buenos_hijos.intervenciones.service.ServicesInterfaces;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.EditCocineroDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditMantenimientoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.UserDTOs.CreateUserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdminService {

    public AdminDto getAdmin(Long userId);

    public Page<AdminDto> getAllAdmins(Pageable pageable);

    public GeneralResponse saveAdmin(CreateAdminDto adminDto);

    public GeneralResponse saveUser(CreateUserDto userDto, String currentUser);

    public GeneralResponse editAdmin(EditAdminDto adminDto, String currentUser);

    public GeneralResponse deleteAdmin(String currentUser, Long adminId);

    public GeneralResponse deleteUser(String currentUser, Long userId);

    public GeneralResponse altaBajaUser(Long userId, String currentUser);

    public GeneralResponse editProfesional(Long profesionalId, EditProfesionalDto profesionalDto);

    public GeneralResponse editNutricionista(Long nutricionistaId, EditNutricionistaDto nutricionistaDto);

    public GeneralResponse editTecnico(Long tecnicoId, EditTecnicoDto tecnicoDto);

    public GeneralResponse editCocinero(Long cocineroId, EditCocineroDto cocineroDto);

    public GeneralResponse editEmpleado(Long empleadoId, EditEmpleadoDto empleadoDto);

    public String encryptPassword(String password);

}

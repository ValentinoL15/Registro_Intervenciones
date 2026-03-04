package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.EditCocineroDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.DisponibilidadDTOs.DisponibilidadDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.HorarioAsistenciaDTOs.HorarioAsistenciaDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.EditEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.EditProfesionalDto;
import com.buenos_hijos.intervenciones.dto.TecnicoDTOs.EditTecnicoDto;
import com.buenos_hijos.intervenciones.dto.UserDTOs.CreateUserDto;
import com.buenos_hijos.intervenciones.embeddables.Disponibilidad;
import com.buenos_hijos.intervenciones.model.*;
import com.buenos_hijos.intervenciones.repository.*;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IAdminService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {

    private final IUserRepository userRepository;
    private final IAdminRepository adminRepository;
    private final IProfesionalRepository profesionalRepository;
    private final ITecnicoRepository tecnicoRepository;
    private final IHorariosAsistenciaRepository horariosAsistenciaRepository;
    private final EmailVerificationService emailVerificationService;
    private final ICocineroRepository cocineroRepository;
    private final INutricionistaRepository nutricionistaRepository;
    private final IEmpleadoRepository empleadoRepository;
    private final Cloudinary cloudinary;


    public String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 10; i++) {
            int randomIndex = random.nextInt(chars.length());
            sb.append(chars.charAt(randomIndex));
        }

        return sb.toString();
    }

    @Override
    public AdminDto getAdmin(Long userId) {

        Admin admin = adminRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("El id no se encuentra"));
        AdminDto adminDto = new AdminDto(
                admin.getUserId(),
                admin.getName(),
                admin.getLastname(),
                admin.getUsername(),
                admin.getEmail(),
                admin.getRole()
        );
        return adminDto;

    }

    @Override
    public List<AdminDto> getAllAdmins() {

        List<Admin> admins = adminRepository.findAll();
        List<AdminDto> adminDtos = admins.stream().map(
            admin -> new AdminDto(
                    admin.getUserId(),
                    admin.getName(),
                    admin.getLastname(),
                    admin.getUsername(),
                    admin.getEmail(),
                    admin.getRole()
            )
        ).collect(Collectors.toList());
        return adminDtos;

    }

    @Override
    @Transactional
    public GeneralResponse saveAdmin(CreateAdminDto adminDto) {

        if(userRepository.existsByEmail(adminDto.getEmail())){
            throw new RuntimeException("El email ya está registrado, prueba con otro");
        }

        if(userRepository.existsByUsername(adminDto.getUsername())){
            throw new RuntimeException("El username ya está en uso, por favor prueba con otro");
        }

        Admin admin = new Admin();
        admin.setName(adminDto.getName());
        admin.setLastname(adminDto.getLastname());
        admin.setEmail(adminDto.getEmail());
        admin.setUsername(adminDto.getUsername());
        admin.setPassword(encryptPassword(adminDto.getPassword()));
        admin.setRole(User.RoleType.ADMIN);

        adminRepository.save(admin);
        return new GeneralResponse(
                new Date(),
                "Administrador creado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse saveUser(CreateUserDto userDto, String currentUser) {

        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar altas");
        }

        if(userRepository.existsByUsername(userDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(userRepository.existsByEmail(userDto.getEmail())){
            throw new RuntimeException("El email ya existe por favor utiliza otro");
        }

        String rawPassword = generateRandomPassword();
        String encryptedPassword = encryptPassword(rawPassword);

        switch (userDto.getRole()) {
            case PROFESIONAL:
                if (userDto.getDisponibilidad() == null || userDto.getDisponibilidad().isEmpty()) {
                    throw new RuntimeException("La disponibilidad es obligatoria para profesionales");
                }

                Profesional prof = new Profesional();
                Set<String> combinacionesVistas = new HashSet<>();
                if(userDto.getDisponibilidad() == null) {
                    throw new RuntimeException("No puedes dejar disponibilidades vacías");
                }

                List<Disponibilidad> disponibilidadesEntidad = userDto.getDisponibilidad().stream()
                        .map(dto -> {
                            if (dto.getDia() == null || dto.getTurno() == null) {
                                throw new RuntimeException("Cada disponibilidad debe tener un día y un turno asignado");
                            }

                            String llave = dto.getDia().toString() + "-" + dto.getTurno().toString();

                            if (!combinacionesVistas.add(llave)) {
                                throw new RuntimeException("No puedes repetir el mismo turno para el día " + dto.getDia());
                            }

                            return new Disponibilidad(dto.getDia(), dto.getTurno());
                        })
                        .collect(Collectors.toList());
                prof.setHourly(userDto.getHourly());
                prof.setName(userDto.getName());
                prof.setLastname(userDto.getLastname());
                prof.setEmail(userDto.getEmail());
                prof.setUsername(userDto.getUsername());
                if(userDto.getDegree() == null) {
                    throw new RuntimeException("Debes colocar una especialidad");
                }
                prof.setDegree(userDto.getDegree());
                prof.setDisponibilidad(disponibilidadesEntidad);
                prof.setRole(User.RoleType.PROFESIONAL);
                prof.setPassword(encryptedPassword);
                profesionalRepository.save(prof);
                break;

            case NUTRICIONISTA:
                Nutricionista nutri = new Nutricionista();
                nutri.setName(userDto.getName());
                nutri.setLastname(userDto.getLastname());
                nutri.setEmail(userDto.getEmail());
                nutri.setPassword(encryptedPassword);
                nutri.setUsername(userDto.getUsername());
                nutri.setHourly(userDto.getHourly());
                nutri.setRole(User.RoleType.NUTRICIONISTA);
                if(userDto.getHorarioAsistencia() == null) {
                    throw new RuntimeException("No puedes dejar horarios vacíos");
                }
                if (userDto.getHorarioAsistencia() != null && !userDto.getHorarioAsistencia().isEmpty()) {
                    List<HorarioAsistencia> horariosEntidad = userDto.getHorarioAsistencia().stream()
                            .map(dto -> {
                                if(dto.getFin().isBefore(dto.getInicio())) {
                                    throw new RuntimeException("El horario de inicio debe ir antes que el horario final para el nutricionista");
                                }

                                HorarioAsistencia horario = new HorarioAsistencia();
                                horario.setDia(dto.getDia());
                                horario.setInicio(dto.getInicio());
                                horario.setFin(dto.getFin());
                                horario.setNutricionista(nutri);

                                return horario;
                            })
                            .collect(Collectors.toList());

                    nutri.setHorarioAsistencias(horariosEntidad);
                }
                nutricionistaRepository.save(nutri);
                break;

            case COCINERO:
                Cocinero cocinero = new Cocinero();
                cocinero.setName(userDto.getName());
                cocinero.setLastname(userDto.getLastname());
                cocinero.setEmail(userDto.getEmail());
                cocinero.setPassword(encryptedPassword);
                cocinero.setUsername(userDto.getUsername());
                cocinero.setHourly(userDto.getHourly());
                cocinero.setRole(User.RoleType.COCINERO);
                cocineroRepository.save(cocinero);
                break;

            case MANTENIMIENTO:
                Empleado empleado = new Empleado();
                empleado.setName(userDto.getName());
                empleado.setLastname(userDto.getLastname());
                empleado.setEmail(userDto.getEmail());
                empleado.setPassword(encryptedPassword);
                empleado.setUsername(userDto.getUsername());
                empleado.setHourly(userDto.getHourly());
                empleado.setRole(User.RoleType.MANTENIMIENTO);
                empleadoRepository.save(empleado);
                break;

            case TECNICO:
                Tecnico2 tecnico2 = new Tecnico2();
                tecnico2.setName(userDto.getName());
                tecnico2.setLastname(userDto.getLastname());
                tecnico2.setEmail(userDto.getEmail());
                tecnico2.setPassword(encryptedPassword);
                tecnico2.setUsername(userDto.getUsername());
                tecnico2.setHourly(userDto.getHourly());
                tecnico2.setRole(User.RoleType.TECNICO);
                tecnico2.setDegree(userDto.getDegree());
                if (userDto.getHorarioAsistencia() != null && !userDto.getHorarioAsistencia().isEmpty()) {
                    List<HorarioAsistencia> horariosEntidad = userDto.getHorarioAsistencia().stream()
                            .map(dto -> {
                                if(dto.getFin().isBefore(dto.getInicio())) {
                                    throw new RuntimeException("El horario de inicio debe ir antes que el horario final");
                                }
                                HorarioAsistencia horario = new HorarioAsistencia();
                                horario.setDia(dto.getDia());
                                horario.setInicio(dto.getInicio());
                                horario.setFin(dto.getFin());

                                horario.setTecnico2(tecnico2);

                                return horario;
                            })
                            .collect(Collectors.toList());

                    tecnico2.setHorarioAsistencias(horariosEntidad);
                }
                tecnicoRepository.save(tecnico2);
                break;

        }

        emailVerificationService.sendEmailWithCredentials(userDto.getEmail(), rawPassword);

        return new GeneralResponse(new Date(), "Usuario creado con éxito", 201);
    }

    @Override
    @Transactional
    public GeneralResponse editAdmin(EditAdminDto adminDto, String currentUser) {

        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(userRepository.existsByUsername(adminDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(adminDto.getName() != null){
            admin.setName(adminDto.getName());
        }
        if(adminDto.getLastname() != null){
            admin.setLastname(adminDto.getLastname());
        }
        if(adminDto.getUsername() != null) {
            admin.setUsername(adminDto.getUsername());
        }
        adminRepository.save(admin);
        return new GeneralResponse(
                new Date(),
                "Admin actualizado con éxito",
                HttpStatus.OK.value()
        );

    }

    @Override
    @Transactional
    public GeneralResponse deleteAdmin(String currentUser, Long adminId) {

        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Admin adminDelete = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("No se encuentra el id del administrador"));

        adminRepository.deleteById(adminDelete.getUserId());
        return new GeneralResponse(
                new Date(),
                "Administrador eliminado con éxito",
                HttpStatus.OK.value()
        );

    }

    @Override
    @Transactional
    public GeneralResponse deleteUser(String currentUser, Long userId) {

        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario a eliminar no existe"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        switch (userToDelete.getRole()) {
            case PROFESIONAL -> {
                if (!profesionalRepository.existsById(userId)) throw new RuntimeException("Profesional no encontrado");
                profesionalRepository.deleteById(userId);
            }
            case COCINERO -> {
                if (!cocineroRepository.existsById(userId)) throw new RuntimeException("Cocinero no encontrado");
                cocineroRepository.deleteById(userId);
            }
            case MANTENIMIENTO -> {
                if (!empleadoRepository.existsById(userId)) throw new RuntimeException("Empleado no encontrado");
                empleadoRepository.deleteById(userId);
            }
            case NUTRICIONISTA -> {
                if (!nutricionistaRepository.existsById(userId)) throw new RuntimeException("Nutricionista no encontrado");
                Nutricionista nutri = nutricionistaRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Nutricionista no encontrado"));
                List<Nutricion_Semanal> reportes = nutri.getNutricion();

                for (Nutricion_Semanal reporte : reportes) {
                    try {
                        if (reporte.getPublicId() != null) {
                            cloudinary.uploader().destroy(reporte.getPublicId(), ObjectUtils.emptyMap());
                        }
                    } catch (IOException e) {
                        System.err.println("No se pudo eliminar el archivo " + reporte.getPublicId() + " de Cloudinary");
                    }
                }

                nutricionistaRepository.delete(nutri);
            }
            case TECNICO ->  {
                if (!tecnicoRepository.existsById(userId)) throw new RuntimeException("Técnico no encontrado");
                tecnicoRepository.deleteById(userId);
            }
            default -> throw new IllegalArgumentException("Tipo de usuario no válido: " + userToDelete.getRole());
        }

        return new GeneralResponse(
                new Date(),
                "Usuario eliminado con éxito",
                HttpStatus.OK.value()
        );

    }

    @Override
    @Transactional
    public GeneralResponse altaBajaUser(Long userId, String currentUser) {

        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        User userToAltaBaja = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(userToAltaBaja.isActive()){
            userToAltaBaja.setActive(false);
        }else {
            userToAltaBaja.setActive(true);
        }
        userRepository.save(userToAltaBaja);
        return new GeneralResponse(new Date(), "Usuario actualizado con éxito", HttpStatus.OK.value());

    }

    @Override
    @Transactional
    public GeneralResponse editProfesional(Long profesionalId, EditProfesionalDto profesionalDto) {

        // 1. Buscar el Profesional o lanzar excepción
        Profesional profesional = profesionalRepository.findById(profesionalId)
                .orElseThrow(() -> new UsernameNotFoundException("Profesional no encontrado"));

        // 2. Actualización de campos básicos con validaciones integradas
        if (profesionalDto.getName() != null) {
            String name = profesionalDto.getName().trim();
            if (name.length() < 3 || name.length() > 20) {
                throw new RuntimeException("El nombre debe tener entre 3 y 20 caracteres");
            }
            profesional.setName(name);
        }

        if (profesionalDto.getLastname() != null) {
            String lastname = profesionalDto.getLastname().trim();
            if (lastname.length() < 3 || lastname.length() > 20) {
                throw new RuntimeException("El apellido debe tener entre 3 y 20 caracteres");
            }
            profesional.setLastname(lastname);
        }

        if (profesionalDto.getHourly() != null) {
            profesional.setHourly(profesionalDto.getHourly());
        }

        if (profesionalDto.getDegree() != null) {
            profesional.setDegree(profesionalDto.getDegree());
        }

        // 3. Gestión de Disponibilidades (Embeddables)
        if (profesionalDto.getDisponibilidades() != null) {
            // Usamos un Set para validar que no haya duplicados en la nueva lista
            Set<String> combinacionesNuevas = new HashSet<>();

            List<Disponibilidad> nuevasDisponibilidades = profesionalDto.getDisponibilidades().stream()
                    .map(dto -> {
                        if (dto.getDia() == null || dto.getTurno() == null) {
                            throw new RuntimeException("Cada disponibilidad debe tener un día y un turno");
                        }

                        String llave = dto.getDia().toString() + "-" + dto.getTurno().toString();
                        if (!combinacionesNuevas.add(llave)) {
                            throw new RuntimeException("No puedes repetir el turno para el día " + dto.getDia());
                        }

                        return new Disponibilidad(dto.getDia(), dto.getTurno());
                    })
                    .collect(Collectors.toList());

            profesional.getDisponibilidad().clear();
            profesional.getDisponibilidad().addAll(nuevasDisponibilidades);
        }

        // 4. Guardar cambios y retornar respuesta
        profesionalRepository.save(profesional);

        return new GeneralResponse(
                new Date(),
                "Perfil de profesional actualizado correctamente",
                HttpStatus.OK.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse editNutricionista(Long nutricionistaId, EditNutricionistaDto nutricionistaDto) {

        Nutricionista nutricionista = nutricionistaRepository.findById(nutricionistaId)
                .orElseThrow(() -> new UsernameNotFoundException("Nutricionista no encontrado"));

        if (nutricionistaDto.getName() != null) {
            nutricionista.setName(nutricionistaDto.getName().trim());
        }
        if (nutricionistaDto.getLastname() != null) {
            nutricionista.setLastname(nutricionistaDto.getLastname().trim());
        }
        if (nutricionistaDto.getHourly() != null) {
            nutricionista.setHourly(nutricionistaDto.getHourly());
        }

        if (nutricionistaDto.getHorarioAsistencias() != null) {

            nutricionista.getHorarioAsistencias().clear();

            for (HorarioAsistenciaDto dto : nutricionistaDto.getHorarioAsistencias()) {
                // Validación de lógica de tiempo
                if (dto.getInicio() != null && dto.getFin() != null) {
                    if (dto.getFin().isBefore(dto.getInicio())) {
                        throw new RuntimeException("Error en día " + dto.getDia() + ": El horario de inicio debe ir antes que el de fin");
                    }
                }

                // Creamos una nueva instancia por cada elemento del DTO
                HorarioAsistencia nuevo = new HorarioAsistencia();
                nuevo.setDia(dto.getDia());
                nuevo.setInicio(dto.getInicio());
                nuevo.setFin(dto.getFin());

                // Vinculamos con el padre
                nuevo.setNutricionista(nutricionista);

                // Agregamos a la lista limpia
                nutricionista.getHorarioAsistencias().add(nuevo);
            }
        }

        nutricionistaRepository.save(nutricionista);
        return new GeneralResponse(new Date(), "Nutricionista actualizado correctamente", HttpStatus.OK.value());
    }

    @Override
    @Transactional
    public GeneralResponse editTecnico(Long tecnicoId, EditTecnicoDto tecnicoDto) {
        Tecnico2 tecnico = tecnicoRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

        // 1. Campos básicos
        if (tecnicoDto.getName() != null) tecnico.setName(tecnicoDto.getName().trim());
        if (tecnicoDto.getLastname() != null) tecnico.setLastname(tecnicoDto.getLastname().trim());
        if (tecnicoDto.getHourly() != null) tecnico.setHourly(tecnicoDto.getHourly());
        if(tecnicoDto.getDegree() != null) tecnico.setDegree(tecnicoDto.getDegree());

        // 2. Horarios (Reemplazo total con orphanRemoval)
        if (tecnicoDto.getHorarioAsistencias() != null) {
            tecnico.getHorarioAsistencias().clear();
            for (HorarioAsistenciaDto dto : tecnicoDto.getHorarioAsistencias()) {
                HorarioAsistencia nuevo = new HorarioAsistencia();
                nuevo.setDia(dto.getDia());
                nuevo.setInicio(dto.getInicio());
                nuevo.setFin(dto.getFin());
                nuevo.setTecnico2(tecnico); // Vinculación
                tecnico.getHorarioAsistencias().add(nuevo);
            }
        }

        tecnicoRepository.save(tecnico);
        return new GeneralResponse(new Date(), "Técnico actualizado", HttpStatus.OK.value());
    }

    @Override
    @Transactional
    public GeneralResponse editCocinero(Long cocineroId, EditCocineroDto cocineroDto) {
        // 1. Buscar el Cocinero
        Cocinero cocinero = cocineroRepository.findById(cocineroId)
                .orElseThrow(() -> new UsernameNotFoundException("Cocinero no encontrado"));

        // 2. Editar Nombre con validación básica
        if (cocineroDto.getName() != null) {
            String name = cocineroDto.getName().trim();
            if (name.length() < 3 || name.length() > 20) {
                throw new RuntimeException("El nombre debe tener entre 3 y 20 caracteres");
            }
            cocinero.setName(name);
        }

        // 3. Editar Apellido
        if (cocineroDto.getLastname() != null) {
            String lastname = cocineroDto.getLastname().trim();
            if (lastname.length() < 3 || lastname.length() > 20) {
                throw new RuntimeException("El apellido debe tener entre 3 y 20 caracteres");
            }
            cocinero.setLastname(lastname);
        }

        // 4. Editar Carga Horaria
        if (cocineroDto.getHourly() != null) {
            cocinero.setHourly(cocineroDto.getHourly());
        }

        // 5. Persistir cambios
        cocineroRepository.save(cocinero);
        return new GeneralResponse(new Date(),
                "Cocinero editado con éxito",
                HttpStatus.OK.value());
    }

    @Override
    @Transactional
    public GeneralResponse editEmpleado(Long empleadoId, EditEmpleadoDto empleadoDto) {
        // 1. Buscar el Empleado (o Mantenimiento/Admin según tu estructura)
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new UsernameNotFoundException("Empleado no encontrado"));

        // 2. Editar Nombre
        if (empleadoDto.getName() != null) {
            String name = empleadoDto.getName().trim();
            if (name.length() < 3 || name.length() > 20) {
                throw new RuntimeException("El nombre debe tener entre 3 y 20 caracteres");
            }
            empleado.setName(name);
        }

        // 3. Editar Apellido
        if (empleadoDto.getLastname() != null) {
            String lastname = empleadoDto.getLastname().trim();
            if (lastname.length() < 3 || lastname.length() > 20) {
                throw new RuntimeException("El apellido debe tener entre 3 y 20 caracteres");
            }
            empleado.setLastname(lastname);
        }

        // 4. Editar Carga Horaria
        if (empleadoDto.getHourly() != null) {
            empleado.setHourly(empleadoDto.getHourly());
        }

        // 5. Persistir
        empleadoRepository.save(empleado);
        return new GeneralResponse(new Date(),
                "Empleado editado con éxito",
                HttpStatus.OK.value());
    }

    @Override
    public String encryptPassword(String password) {
        return new BCryptPasswordEncoder().encode(password);
    }
}

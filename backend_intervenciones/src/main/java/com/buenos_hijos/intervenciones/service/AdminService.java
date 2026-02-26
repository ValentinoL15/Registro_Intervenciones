package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
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
    public Page<AdminDto> getAllAdmins(@PageableDefault Pageable pageable) {

        Page<Admin> admins = adminRepository.findAll(pageable);
        Page<AdminDto> adminDtos = admins.map(
            admin -> new AdminDto(
                    admin.getUserId(),
                    admin.getName(),
                    admin.getLastname(),
                    admin.getUsername(),
                    admin.getEmail(),
                    admin.getRole()
            )
        );
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
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
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
    public GeneralResponse altaBajaCocinero(Long cocineroId, String currentUser) {

        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Cocinero cocinero = cocineroRepository.findById(cocineroId)
                .orElseThrow(() -> new UsernameNotFoundException("El cocinero no se encuentra disponible"));

        if(cocinero.isActive()){
            cocinero.setActive(false);
        }else {
            cocinero.setActive(true);
        }
        cocineroRepository.save(cocinero);
        return new GeneralResponse(new Date(), "Cocinero actualizado con éxito", HttpStatus.OK.value());

    }

    @Override
    public GeneralResponse deleteCocinero(Long cocineroId, String currentUser) {
        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Cocinero cocinero = cocineroRepository.findById(cocineroId)
                .orElseThrow(() -> new UsernameNotFoundException("El cocinero no se encuentra disponible"));

        cocineroRepository.deleteById(cocinero.getUserId());

        return new GeneralResponse(
                new Date(),
                "Cocinero eliminado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public GeneralResponse deleteNutricionista(Long nutricionistaId, String currentUser) {
        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Nutricionista nutricionista = nutricionistaRepository.findById(nutricionistaId)
                .orElseThrow(() -> new UsernameNotFoundException("El nutricionista no se encuentra disponible"));

        cocineroRepository.deleteById(nutricionista.getUserId());

        return new GeneralResponse(
                new Date(),
                "Nutricionista eliminado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public GeneralResponse deleteEmpleado(Long empleadoId, String currentUser) {
        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new UsernameNotFoundException("El empleado de mantenimiento no se encuentra disponible"));

        cocineroRepository.deleteById(empleado.getUserId());

        return new GeneralResponse(
                new Date(),
                "Empleado de mantenimiento eliminado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public String encryptPassword(String password) {
        return new BCryptPasswordEncoder().encode(password);
    }
}

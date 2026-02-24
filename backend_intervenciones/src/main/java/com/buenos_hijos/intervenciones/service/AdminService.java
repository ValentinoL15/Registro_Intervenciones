package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.SaveCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.MantenimientoDTOs.SaveEmpleadoDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionistaDto;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.embeddables.Disponibilidad;
import com.buenos_hijos.intervenciones.model.*;
import com.buenos_hijos.intervenciones.repository.*;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.IAdminService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
    public GeneralResponse saveProfesional(CreateProfesionalDto profesionalDto, String currentUser) {

        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(userRepository.existsByUsername(profesionalDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(userRepository.existsByEmail(profesionalDto.getEmail())){
            throw new RuntimeException("El email ya existe por favor utiliza otro");
        }

        if (profesionalDto.getDisponibilidad() == null || profesionalDto.getDisponibilidad().isEmpty()) {
            throw new RuntimeException("La lista de disponibilidad no puede estar vacía");
        }

        Set<String> combinacionesVistas = new HashSet<>();

        List<Disponibilidad> disponibilidadesEntidad = profesionalDto.getDisponibilidad().stream()
                .map(dto -> {
                    if (dto.getDia() == null || dto.getTurno() == null) {
                        throw new RuntimeException("Cada disponibilidad debe tener un día y un turno asignado");
                    }

                    // Creamos una llave única, ej: "LUNES-MAÑANA"
                    String llave = dto.getDia().toString() + "-" + dto.getTurno().toString();

                    if (!combinacionesVistas.add(llave)) {
                        throw new RuntimeException("No puedes repetir el mismo turno para el día " + dto.getDia());
                    }

                    return new Disponibilidad(dto.getDia(), dto.getTurno());
                })
                .collect(Collectors.toList());

        Profesional profesional = new Profesional();
        profesional.setName(profesionalDto.getName());
        profesional.setLastname(profesionalDto.getLastname());
        profesional.setUsername(profesionalDto.getUsername());
        profesional.setEmail(profesionalDto.getEmail());
        String rawPassword = generateRandomPassword();
        profesional.setPassword(encryptPassword(rawPassword));
        profesional.setRole(User.RoleType.PROFESIONAL);
        profesional.setHourly(profesionalDto.getHourly());
        profesional.setDisponibilidad(disponibilidadesEntidad);
        profesional.setActive(true);

        profesionalRepository.save(profesional);
        emailVerificationService.sendEmailWithCredentials(profesional.getEmail(),rawPassword);

        return new GeneralResponse(
                new Date(),
                "Profesional creado con éxito",
                HttpStatus.CREATED.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse saveCocinero(SaveCocineroDto cocineroDto, String currentUser) {
        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(userRepository.existsByUsername(cocineroDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(userRepository.existsByEmail(cocineroDto.getEmail())){
            throw new RuntimeException("El email ya existe por favor utiliza otro");
        }

        Cocinero cocinero = new Cocinero();
        cocinero.setName(cocineroDto.getName());
        cocinero.setLastname(cocineroDto.getLastname());
        cocinero.setRole(User.RoleType.COCINERO);
        cocinero.setUsername(cocineroDto.getUsername());
        String rawPassword = generateRandomPassword();
        cocinero.setPassword(encryptPassword(rawPassword));
        cocinero.setEmail(cocineroDto.getEmail());
        cocinero.setActive(true);
        cocineroRepository.save(cocinero);
        emailVerificationService.sendEmailWithCredentials(cocinero.getEmail(),rawPassword);
        return new GeneralResponse(
                new Date(),
                "Cocinero creado con éxito",
                HttpStatus.CREATED.value()
        );

    }

    @Override
    @Transactional
    public GeneralResponse saveNutricionista(SaveNutricionistaDto nutricionistaDto, String currentUser) {
        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(userRepository.existsByUsername(nutricionistaDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(userRepository.existsByEmail(nutricionistaDto.getEmail())){
            throw new RuntimeException("El email ya existe por favor utiliza otro");
        }

        Nutricionista nutricionista = new Nutricionista();
        nutricionista.setName(nutricionistaDto.getName());
        nutricionista.setLastname(nutricionistaDto.getLastname());
        nutricionista.setRole(User.RoleType.NUTRICIONISTA);
        nutricionista.setUsername(nutricionistaDto.getUsername());
        String rawPassword = generateRandomPassword();
        nutricionista.setPassword(encryptPassword(rawPassword));
        nutricionista.setEmail(nutricionistaDto.getEmail());
        nutricionista.setActive(true);
        nutricionista.setHourly(nutricionistaDto.getHourly());
        nutricionistaRepository.save(nutricionista);
        emailVerificationService.sendEmailWithCredentials(nutricionista.getEmail(),rawPassword);
        return new GeneralResponse(
                new Date(),
                "Nutricionista creado con éxito",
                HttpStatus.CREATED.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse saveEmpleado(SaveEmpleadoDto empleadoDto, String currentUser) {
        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(userRepository.existsByUsername(empleadoDto.getUsername())){
            throw new RuntimeException("El username ya existe por favor utiliza otro");
        }

        if(userRepository.existsByEmail(empleadoDto.getEmail())){
            throw new RuntimeException("El email ya existe por favor utiliza otro");
        }

        Empleado empleado = new Empleado();
        empleado.setName(empleadoDto.getName());
        empleado.setLastname(empleadoDto.getLastname());
        empleado.setRole(User.RoleType.MANTENIMIENTO);
        empleado.setEmail(empleadoDto.getEmail());
        String rawPassword = generateRandomPassword();
        empleado.setPassword(encryptPassword(rawPassword));
        empleado.setUsername(empleadoDto.getUsername());
        empleadoRepository.save(empleado);
        emailVerificationService.sendEmailWithCredentials(empleado.getEmail(),rawPassword);
        return new GeneralResponse(
                new Date(),
                "Empleado de mantenimiento creado con éxito",
                HttpStatus.CREATED.value()
        );
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
    public GeneralResponse deleteProfesional(String currentUser, Long profesionalId) {

        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Profesional profesional = profesionalRepository.findById(profesionalId)
                .orElseThrow(() -> new UsernameNotFoundException("El profesional no se encuentra disponible"));

        profesionalRepository.deleteById(profesional.getUserId());

        return new GeneralResponse(
                new Date(),
                "Profesional eliminado con éxito",
                HttpStatus.OK.value()
        );

    }

    @Override
    @Transactional
    public GeneralResponse altaBajaProfesional(Long profesionalId, String currentUser) {

        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Profesional profesional = profesionalRepository.findById(profesionalId)
                .orElseThrow(() -> new UsernameNotFoundException("El profesional no se encuentra disponible"));

        if(profesional.isActive()){
            profesional.setActive(false);
        }else {
            profesional.setActive(true);
        }
        profesionalRepository.save(profesional);
        return new GeneralResponse(new Date(), "Profesional actualizado con éxito", HttpStatus.OK.value());

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

package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.AdminDTOs.AdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.CreateAdminDto;
import com.buenos_hijos.intervenciones.dto.AdminDTOs.EditAdminDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.ProfesionalDTOs.CreateProfesionalDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.Profesional;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.IAdminRepository;
import com.buenos_hijos.intervenciones.repository.IProfesionalRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {

    private final IUserRepository userRepository;
    private final IAdminRepository adminRepository;
    private final IProfesionalRepository profesionalRepository;
    private final EmailVerificationService emailVerificationService;

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

        Profesional profesional = new Profesional();
        profesional.setName(profesionalDto.getName());
        profesional.setLastname(profesionalDto.getLastname());
        profesional.setUsername(profesionalDto.getUsername());
        profesional.setEmail(profesionalDto.getEmail());
        String rawPassword = generateRandomPassword();
        profesional.setPassword(encryptPassword(rawPassword));
        profesional.setRole(User.RoleType.PROFESIONAL);
        profesional.setDays(profesionalDto.getDays());
        profesional.setHourly(profesionalDto.getHourly());
        profesional.setTurno(profesionalDto.getTurno());
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
    public GeneralResponse editAdmin(EditAdminDto adminDto, String currentUser) {

        Admin admin = adminRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el username del administrador"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        if(admin.getName() != null){
            admin.setName(adminDto.getName());
        }
        if(admin.getLastname() != null){
            admin.setLastname(adminDto.getLastname());
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
    public GeneralResponse altaProfesional(String currentUser, Long profesionalId) {
        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if(admin.getRole() != User.RoleType.ADMIN){
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Profesional profesional = profesionalRepository.findById(profesionalId)
                .orElseThrow(() -> new UsernameNotFoundException("El profesional no se encuentra disponible"));

        profesional.setActive(true);
        profesionalRepository.save(profesional);
        return new GeneralResponse(
                new Date(),
                "Profesional dado de alta con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public GeneralResponse bajaProfesional(String currentUser, Long profesionalId) {
        User admin = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no se encuentra disponible"));

        if (admin.getRole() != User.RoleType.ADMIN) {
            throw new RuntimeException("Acceso denegado: Solo los administradores pueden dar bajas");
        }

        Profesional profesional = profesionalRepository.findById(profesionalId)
                .orElseThrow(() -> new UsernameNotFoundException("El profesional no se encuentra disponible"));

        profesional.setActive(false);
        profesionalRepository.save(profesional);
        return new GeneralResponse(
                new Date(),
                "Profesional dado de baja con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public String encryptPassword(String password) {
        return new BCryptPasswordEncoder().encode(password);
    }
}

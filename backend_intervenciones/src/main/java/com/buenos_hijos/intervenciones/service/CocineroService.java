package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.*;
import com.buenos_hijos.intervenciones.embeddables.Cocina;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.model.Cocinero;
import com.buenos_hijos.intervenciones.repository.IAdminRepository;
import com.buenos_hijos.intervenciones.repository.ICocineroRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.ICocineroService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CocineroService implements ICocineroService {

    private final ICocineroRepository cocineroRepository;
    private final IAdminRepository adminRepository;
    private final IUserRepository userRepository;

    @Override
    public CocineroDto getCocinero(Long userId) {
        Cocinero cocinero = cocineroRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("El cocinero no se encuentra"));
        CocineroDto cocineroDto = new CocineroDto();
        cocineroDto.setUserId(cocinero.getUserId());
        cocineroDto.setName(cocinero.getName());
        cocineroDto.setLastname(cocinero.getLastname());
        cocineroDto.setUsername(cocinero.getUsername());
        cocineroDto.setEmail(cocinero.getEmail());
        cocineroDto.setActive(cocinero.isActive());
        /*if (cocinero.getCocina() != null) {
            List<CocinaDto> cocinaDtos = cocinero.getCocina().stream()
                    .map(c -> {
                        CocinaDto dto = new CocinaDto();
                        dto.setDia(c.getDia());
                        dto.setTipoComida(c.getTipoComida());
                        dto.setDescription(c.getDescription());
                        return dto;
                    })
                    .collect(Collectors.toList());

            cocineroDto.setCocina(cocinaDtos);
        }*/
        return cocineroDto;
    }

    @Override
    public Page<CocineroDto> getCocineros(Pageable pageable) {
        return cocineroRepository.findAll(pageable).map(cocinero -> {
            CocineroDto dto = new CocineroDto();
            dto.setUserId(cocinero.getUserId());
            dto.setName(cocinero.getName());
            dto.setLastname(cocinero.getLastname());
            dto.setUsername(cocinero.getUsername());
            dto.setEmail(cocinero.getEmail());
            dto.setActive(cocinero.isActive());

            /*if (cocinero.getCocina() != null) {
                dto.setCocina(cocinero.getCocina().stream()
                        .map(c -> new CocinaDto(c.getDia(), c.getTipoComida(), c.getDescription(), c.getFecha()))
                        .collect(Collectors.toList()));
            }*/
            return dto;
        });
    }

    @Override
    public List<AdminCocinaResponseDto> getAllComidas() {
        List<Cocina> todasLasComidas = cocineroRepository.findAllCocinasOrderByFechaDesc();

        return todasLasComidas.stream()
                .collect(Collectors.groupingBy(Cocina::getFecha))
                .entrySet().stream()
                .map(entry -> {
                    AdminCocinaResponseDto dto = new AdminCocinaResponseDto();
                    dto.setFecha(entry.getKey());

                    dto.setPlatos(entry.getValue().stream()
                            .map(c -> new ComidaDto(c.getTipoComida(), c.getDescription()))
                            .collect(Collectors.toList()));

                    return dto;
                })
                .sorted(Comparator.comparing(AdminCocinaResponseDto::getFecha).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GeneralResponse createComida(CreateCocinaBatchDto batchDto, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        LocalDate fechaReferencia = batchDto.getCocina().getFecha();
        if (batchDto.getPlatos() == null || batchDto.getPlatos().isEmpty()) {
            throw new RuntimeException("La lista de platos no puede estar vacía");
        }

        boolean fechaYaExisteEnBd = cocinero.getCocina().stream()
                .anyMatch(c -> c.getFecha() != null && c.getFecha().equals(fechaReferencia));

        if (fechaYaExisteEnBd) {
            throw new RuntimeException("Error: La fecha " + fechaReferencia + " ya tiene registros.");
        }


        Set<Cocina.TipoComida> tiposEnEsteEnvio = new HashSet<>();

        for (ComidaDto plato : batchDto.getPlatos()) {

            if (!tiposEnEsteEnvio.add(plato.getTipoComida())) {
                throw new RuntimeException("Error: Has incluido el tipo " + plato.getTipoComida() + " duplicado.");
            }

            Cocina nuevaComida = new Cocina();
            nuevaComida.setFecha(fechaReferencia);
            nuevaComida.setTipoComida(plato.getTipoComida());
            nuevaComida.setDescription(plato.getDescription());

            cocinero.getCocina().add(nuevaComida);
        }

        cocineroRepository.save(cocinero);

        return new GeneralResponse(
                new Date(),
                "Menú del día " + " registrado con éxito",
                HttpStatus.CREATED.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse editComida(CreateCocinaBatchDto batchDto, String currentUser, LocalDate fechaOriginal) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        LocalDate fechaNueva = batchDto.getCocina().getFecha();

        // 1. VALIDACIÓN: No permitir duplicados en el JSON (Ej: dos NOCELIACO)
        Set<Cocina.TipoComida> tiposEnJson = new HashSet<>();
        for (ComidaDto plato : batchDto.getPlatos()) {
            if (!tiposEnJson.add(plato.getTipoComida())) {
                throw new RuntimeException("Error: No puedes enviar el tipo " + plato.getTipoComida() + " dos veces en el mismo envío.");
            }
        }

        // 2. VALIDACIÓN: Si la fecha cambia, verificar que la nueva no esté ocupada
        if (!fechaOriginal.equals(fechaNueva)) {
            boolean fechaOcupada = cocinero.getCocina().stream()
                    .anyMatch(c -> c.getFecha().equals(fechaNueva));
            if (fechaOcupada) {
                throw new RuntimeException("Error: La fecha " + fechaNueva + " ya tiene un menú. No se puede mover.");
            }
        }

        // 3. BUSCAR REGISTROS: Solo los que ya existen para la fecha original
        List<Cocina> platosExistentes = cocinero.getCocina().stream()
                .filter(c -> c.getFecha().equals(fechaOriginal))
                .collect(Collectors.toList());

        if (platosExistentes.isEmpty()) {
            throw new RuntimeException("Error: No existen registros para la fecha " + fechaOriginal + ". No hay nada que editar.");
        }

        // 4. ACTUALIZACIÓN ESTRICTA: Solo editamos lo que encontramos
        for (ComidaDto platoDto : batchDto.getPlatos()) {
            Cocina entidad = platosExistentes.stream()
                    .filter(p -> p.getTipoComida().equals(platoDto.getTipoComida()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Error: El tipo " + platoDto.getTipoComida() + " no existía originalmente en la fecha " + fechaOriginal + ". No se puede crear uno nuevo aquí."));

            entidad.setDescription(platoDto.getDescription());
            entidad.setFecha(fechaNueva);
            // El campo dia lo quitamos o se calcula solo, ya no lo seteamos del DTO
        }

        cocineroRepository.save(cocinero);

        return new GeneralResponse(
                new Date(),
                "Menú actualizado correctamente para el " + fechaNueva,
                HttpStatus.OK.value()
        );
    }

    @Override
    @Transactional
    public GeneralResponse editCocinero(EditCocineroDto cocineroDto, String currentUser) {

            Cocinero cocinero = cocineroRepository.findByUsername(cocineroDto.getUsername())
                    .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

            if(!cocinero.getUsername().equals(currentUser)){
                throw new RuntimeException("Acceso denegado: no tienes permisos para editar este usuario");
            }

        if (cocineroDto.getUsername() != null && !cocineroDto.getUsername().equals(cocinero.getUsername())) {
            if (userRepository.existsByUsername(cocineroDto.getUsername())) {
                throw new RuntimeException("El username " + cocineroDto.getUsername() + " ya está en uso.");
            }
            cocinero.setUsername(cocineroDto.getUsername());
        }

            cocinero.setName(cocineroDto.getName());
            cocinero.setLastname(cocineroDto.getLastname());


            cocineroRepository.save(cocinero);

            return new GeneralResponse(
                    new Date(),
                    "Cocinero actualizado con éxito",
                    HttpStatus.OK.value()
            );
    }

    @Override
    @Transactional
    public GeneralResponse deleteComida(LocalDate fechaOriginal, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("No se encuentra el cocinero"));

        int tamañoAntes = cocinero.getCocina().size();

        cocinero.getCocina().removeIf(plato ->
                plato.getFecha() != null && plato.getFecha().equals(fechaOriginal)
        );

        if (cocinero.getCocina().size() == tamañoAntes) {
            throw new RuntimeException("No se encontraron platos para eliminar en la fecha: " + fechaOriginal);
        }

        cocineroRepository.save(cocinero);

        return new GeneralResponse(
                new Date(),
                "Menú del día " + fechaOriginal + " eliminado con éxito",
                HttpStatus.OK.value()
        );
    }
}

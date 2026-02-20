package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CreateCocinaBatchDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Cocina;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CocinaDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.CocineroDto;
import com.buenos_hijos.intervenciones.dto.CocineroDTOs.EditCocineroDto;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.model.Admin;
import com.buenos_hijos.intervenciones.model.Cocinero;
import com.buenos_hijos.intervenciones.model.User;
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
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
        if (cocinero.getCocina() != null) {
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
        }
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

            if (cocinero.getCocina() != null) {
                dto.setCocina(cocinero.getCocina().stream()
                        .map(c -> new CocinaDto(c.getDia(), c.getTipoComida(), c.getDescription(), c.getFecha()))
                        .collect(Collectors.toList()));
            }
            return dto;
        });
    }

    @Override
    @Transactional
    public GeneralResponse createComida(CreateCocinaBatchDto batchDto, String currentUser) {

        Cocinero cocinero = cocineroRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("El cocinero no existe"));

        if (batchDto.getCocina().isEmpty()) {
            throw new RuntimeException("La lista de cocina no puede estar vacía");
        }

        LocalDate fechaReferencia = batchDto.getCocina().get(0).getFecha();
        Cocina.DiaCocinero diaReferencia = batchDto.getCocina().get(0).getDia();

        boolean fechaYaExisteEnBd = cocinero.getCocina().stream()
                .anyMatch(c -> c.getFecha() != null && c.getFecha().equals(fechaReferencia));

        if (fechaYaExisteEnBd) {
            throw new RuntimeException("Error: La fecha " + fechaReferencia + " ya tiene registros. No se puede modificar.");
        }

        Set<Cocina.TipoComida> tiposEnEsteEnvio = new HashSet<>();

        for (CocinaDto dto : batchDto.getCocina()) {

            if (!dto.getFecha().equals(fechaReferencia)) {
                throw new RuntimeException("Error: No puedes mezclar fechas en el mismo envío.");
            }

            if (!dto.getDia().equals(diaReferencia)) {
                throw new RuntimeException("Error: Todos los registros deben ser del mismo día (" + diaReferencia + ")");
            }

            if (!tiposEnEsteEnvio.add(dto.getTipoComida())) {
                throw new RuntimeException("Error: Has incluido el tipo " + dto.getTipoComida() + " dos veces en el mismo envío.");
            }


            Cocina nuevaComida = new Cocina();
            nuevaComida.setDia(dto.getDia());
            nuevaComida.setTipoComida(dto.getTipoComida());
            nuevaComida.setDescription(dto.getDescription());
            nuevaComida.setFecha(dto.getFecha());

            cocinero.getCocina().add(nuevaComida);
        }

        cocineroRepository.save(cocinero);

        return new GeneralResponse(
                new Date(),
                "Menú de " + diaReferencia + " registrado con éxito",
                HttpStatus.CREATED.value()
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

            cocinero.setName(cocineroDto.getName());
            cocinero.setLastname(cocineroDto.getLastname());

            if (cocineroDto.getCocina() != null) {

                cocinero.getCocina().clear();

                Set<String> combinacionesVistas = new HashSet<>();

                List<Cocina> nuevasEntradas = cocineroDto.getCocina().stream()
                        .map(dto -> {
                            if (dto.getDia() == null || dto.getTipoComida() == null) {
                                throw new RuntimeException("Cada entrada de cocina debe tener día y tipo de comida");
                            }

                            // Validación de duplicados: No puede haber dos registros para "LUNES-CELIACO"
                            String clave = dto.getDia().toString() + "-" + dto.getTipoComida().toString();
                            if (!combinacionesVistas.add(clave)) {
                                throw new RuntimeException("Ya existe una descripción para el día " + dto.getDia() + " como " + dto.getTipoComida());
                            }

                            Cocina cocina = new Cocina();
                            cocina.setDia(dto.getDia());
                            cocina.setTipoComida(dto.getTipoComida());
                            cocina.setDescription(dto.getDescription());
                            return cocina;
                        })
                        .collect(Collectors.toList());

                cocinero.getCocina().addAll(nuevasEntradas);
            }
            cocineroRepository.save(cocinero);

            return new GeneralResponse(
                    new Date(),
                    "Cocinero actualizado con éxito",
                    HttpStatus.OK.value()
            );
    }
}

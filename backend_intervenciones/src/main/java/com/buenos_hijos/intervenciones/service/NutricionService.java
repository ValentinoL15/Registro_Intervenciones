package com.buenos_hijos.intervenciones.service;

import com.buenos_hijos.intervenciones.config.CloudinaryConfig;
import com.buenos_hijos.intervenciones.dto.GeneralResponse;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.EditNutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionSemanalDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.NutricionistaDto;
import com.buenos_hijos.intervenciones.dto.NutricionistaDTOs.SaveNutricionSemanalDto;
import com.buenos_hijos.intervenciones.exceptions.ExceptionsHandler.AccessDeniedException;
import com.buenos_hijos.intervenciones.model.Nutricion_Semanal;
import com.buenos_hijos.intervenciones.model.Nutricionista;
import com.buenos_hijos.intervenciones.model.User;
import com.buenos_hijos.intervenciones.repository.INutricion_SemanalRepository;
import com.buenos_hijos.intervenciones.repository.INutricionistaRepository;
import com.buenos_hijos.intervenciones.repository.IUserRepository;
import com.buenos_hijos.intervenciones.service.ServicesInterfaces.INutricionService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NutricionService implements INutricionService {

    private final INutricionistaRepository nutricionistaRepository;
    private final INutricion_SemanalRepository nutricionSemanalRepository;
    private final IUserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;


    @Override
    public NutricionistaDto getNutricionista(Long nutricionistaId) {
        Nutricionista nutricionista = nutricionistaRepository.findById(nutricionistaId)
                .orElseThrow(() -> new RuntimeException("El nutricionista no se encuentra"));
        NutricionistaDto nutricionistaDto = new NutricionistaDto();
        nutricionistaDto.setUserId(nutricionista.getUserId());
        nutricionistaDto.setName(nutricionista.getName());
        nutricionistaDto.setLastname(nutricionista.getLastname());
        nutricionistaDto.setEmail(nutricionista.getEmail());
        nutricionistaDto.setHourly(nutricionista.getHourly());
        nutricionistaDto.setActive(nutricionista.isActive());
        return nutricionistaDto;
    }

    @Override
    public Page<NutricionistaDto> getNutricionistas(Pageable pageable) {

        Page<Nutricionista> nutricionistasPage = nutricionistaRepository.findAll(pageable);

        return nutricionistasPage.map(nutricionista -> {
            NutricionistaDto dto = new NutricionistaDto();
            dto.setUserId(nutricionista.getUserId());
            dto.setName(nutricionista.getName());
            dto.setLastname(nutricionista.getLastname());
            dto.setEmail(nutricionista.getEmail());
            dto.setHourly(nutricionista.getHourly());
            dto.setActive(nutricionista.isActive());
            return dto;
        });
    }

    @Override
    public NutricionSemanalDto getReporte(Long id) {
        return nutricionSemanalRepository.findById(id)
                .map(reporte -> {
                    NutricionSemanalDto dto = new NutricionSemanalDto();
                    dto.setFechaInicio(reporte.getFechaInicio());
                    dto.setFechaFinal(reporte.getFechaFinal());
                    dto.setArchivo(reporte.getUrlPdf()); // Usamos la URL generada de Cloudinary
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("Reporte nutricional no encontrado"));
    }

    @Override
    public Page<NutricionSemanalDto> getMisReportes(Pageable pageable) {

        Page<Nutricion_Semanal> nutricionSemanal = nutricionSemanalRepository.findAll(pageable);

        return nutricionSemanal.map(reporte -> {
            NutricionSemanalDto dto = new NutricionSemanalDto();
            dto.setId(reporte.getId());
            dto.setFechaInicio(reporte.getFechaInicio());
            dto.setFechaFinal(reporte.getFechaFinal());
            dto.setArchivo(reporte.getUrlPdf());

            // Accedemos a la relación y concatenamos nombre y apellido
            if (reporte.getNutricionista() != null) {
                String nombreCompleto = reporte.getNutricionista().getName() + " " +
                        reporte.getNutricionista().getLastname();
                dto.setNombreNutricionista(nombreCompleto);
            } else {
                dto.setNombreNutricionista("Sin asignar");
            }

            return dto;
        });
    }

    @Override
    @Transactional
    public GeneralResponse saveNutricionSemanal(SaveNutricionSemanalDto dto, MultipartFile archivo, String currentUser) {
        Nutricionista nutricionista = nutricionistaRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("Nutricionista no encontrado"));

        if(dto.getFechaFinal().isBefore(dto.getFechaInicio())){
            throw new RuntimeException("La fecha de inicio debe ser anterior a la final");
        }


        try {
            String contentType = archivo.getContentType();

            Map uploadResult = cloudinary.uploader().upload(
                    archivo.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "folder", "reportes_nutricion",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            String urlGenerada = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");


            // Guardar también el resourceType para saber cómo mostrarlo luego
            Nutricion_Semanal reporte = new Nutricion_Semanal();
            reporte.setFechaInicio(dto.getFechaInicio());
            reporte.setFechaFinal(dto.getFechaFinal());
            reporte.setUrlPdf(urlGenerada);
            reporte.setPublicId(publicId);
            reporte.setNombreArchivo(archivo.getOriginalFilename());
            reporte.setTipoArchivo(contentType);
            reporte.setNutricionista(nutricionista);
            nutricionista.getNutricion().add(reporte);

            nutricionistaRepository.save(nutricionista);

            return new GeneralResponse(
                    new Date(),
                    "Reporte semanal subido con éxito: " + urlGenerada,
                    HttpStatus.CREATED.value()
            );

        } catch (IOException e) {
            throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
        }
    }

    @Override
    public GeneralResponse editNutricionSemanal(Long id, EditNutricionSemanalDto dto, MultipartFile nuevoArchivo, String currentUser) {

        Nutricionista nutricionista = nutricionistaRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("Nutricionista no encontrado"));

        Nutricion_Semanal reporte = nutricionSemanalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        reporte.setFechaInicio(dto.getFechaInicio());
        reporte.setFechaFinal(dto.getFechaFinal());

        if (nuevoArchivo != null && !nuevoArchivo.isEmpty()) {
            try {
                cloudinary.uploader().destroy(reporte.getPublicId(), ObjectUtils.emptyMap());

                Map uploadResult = cloudinary.uploader().upload(nuevoArchivo.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto", "folder", "reportes_nutricion"));

                reporte.setUrlPdf((String) uploadResult.get("secure_url"));
                reporte.setPublicId((String) uploadResult.get("public_id"));
                reporte.setNombreArchivo(nuevoArchivo.getOriginalFilename());

            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo en Cloudinary");
            }
        }

        nutricionSemanalRepository.save(reporte);

        return new GeneralResponse(
                new Date(),
                "Reporte actualizado con éxito",
                HttpStatus.OK.value()
        );
    }

    @Override
    public GeneralResponse deleteNutricionSemanal(Long nutricionSemanalId, String currentUser) {
        // 1. Buscar el reporte
        Nutricion_Semanal reporte = nutricionSemanalRepository.findById(nutricionSemanalId)
                .orElseThrow(() -> new RuntimeException("El reporte no existe"));

        try {

            cloudinary.uploader().destroy(reporte.getPublicId(), ObjectUtils.emptyMap());

            nutricionSemanalRepository.delete(reporte);

            return new GeneralResponse(
                    new Date(),
                    "Reporte eliminado correctamente de la base de datos y la nube",
                    HttpStatus.OK.value()
            );
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar el archivo de Cloudinary");
        }
    }

}

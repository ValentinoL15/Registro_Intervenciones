package com.buenos_hijos.intervenciones.dto.IntervencionDTOs;

import com.buenos_hijos.intervenciones.model.Intervencion;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateIntervencionDto {


    @NotNull(message = "Debes elegir un tipo de destinatario")
    private Intervencion.DestinyType tipo;
    @NotBlank(message = "Debes colocar el nombre de la institucion o de la familia visitada")
    @Size(min = 3, max = 30, message = "El nombre debe tener entre {min} y {max} caracteres")
    private String nombre;
    @NotNull(message = "Debes colocar una fecha")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fecha;
    @NotBlank(message = "Debes colocar un horario")
    private String hora;
    @NotBlank(message = "Debes colocar el motivo de la visita")
    @Size(min = 5, max = 60, message = "El motivo debe contener entre {min} y {max} caracteres")
    private String motivo;
    @NotNull(message = "Debes colocar si la intervención fue realizada en equipo o individualemente")
    private Intervencion.IntervencionType intervencion;
    private String observaciones;

    private List<Long> profesionalesIds;

}

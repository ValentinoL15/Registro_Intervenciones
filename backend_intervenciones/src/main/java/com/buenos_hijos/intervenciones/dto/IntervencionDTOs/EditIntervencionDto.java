package com.buenos_hijos.intervenciones.dto.IntervencionDTOs;

import com.buenos_hijos.intervenciones.model.Intervencion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditIntervencionDto {


    private Intervencion.DestinyType tipo;

    @Size(min = 3, max = 30, message = "El nombre debe tener entre {min} y {max} caracteres")
    private String nombre;

    private LocalDateTime fecha;

    private String hora;

    @Size(min = 5, max = 60, message = "El motivo debe contener entre {min}  y {max} caracteres")
    private String motivo;

    private Intervencion.IntervencionType intervencion;

    private String observaciones;

}

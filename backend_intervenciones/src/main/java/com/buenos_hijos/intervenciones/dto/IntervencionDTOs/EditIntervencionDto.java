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

    @Size(min = 3, max = 15, message = "El nombre debe tener entre {min} y {max} caracteres")
    private String nombre;

    private LocalDateTime fecha;

    private String hora;

    @Size(min = 5, message = "El motivo debe contener un minimo de 5 caracteres")
    private String motivo;

    private Intervencion.IntervencionType intervencion;
    @Size(min = 3,max = 80, message = "La observación debe tener entre {min} y {max} caracteres")
    private String observaciones;

}

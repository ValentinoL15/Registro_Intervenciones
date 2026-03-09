package com.buenos_hijos.intervenciones.dto.IntervencionDTOs;

import com.buenos_hijos.intervenciones.model.Intervencion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IntervencionDto {

    private Long intervencionId;
    private Long creadorId;
    private Intervencion.DestinyType tipo;
    private String nombre;
    private LocalDateTime fecha;
    private String hora;
    private String motivo;
    private Intervencion.IntervencionType intervencion;
    private String observaciones;


}

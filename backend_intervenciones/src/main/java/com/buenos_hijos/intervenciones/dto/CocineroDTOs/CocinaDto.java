package com.buenos_hijos.intervenciones.dto.CocineroDTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CocinaDto {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

}

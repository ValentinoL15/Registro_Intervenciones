"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, Utensils, User2, Ban, CheckCircle2 } from "lucide-react";

export function CocinerosTable({ menus }: { menus: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMenus = menus.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [menus.length, totalPages, currentPage]);

  if (menus.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay menús registrados por cocina</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Cocinero</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
              <TableHead>Menú del Día</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMenus.map((menu) => (
              <TableRow key={menu.menuId} className="hover:bg-muted/30 transition-colors">
                {/* Nombre del Cocinero */}
                <TableCell className="align-top">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <User2 className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium text-sm">{menu.nombreCocinero}</span>
                  </div>
                </TableCell>

                {/* Fecha */}
                <TableCell className="align-top">
                  <Badge variant="outline" className="font-normal flex w-fit gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-orange-600" />
                    {menu.fecha}
                  </Badge>
                </TableCell>

                {/* Platos (General y Celiaco) */}
                <TableCell>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menu.cocina?.map((plato: any) => (
                      <div 
                        key={plato.id} 
                        className={`p-2 rounded-lg border text-xs shadow-sm flex flex-col gap-1 ${
                          plato.tipoComida === 'CELIACO' 
                            ? 'bg-orange-50/40 border-orange-100' 
                            : 'bg-green-50/40 border-green-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] opacity-70">
                          {plato.tipoComida === 'CELIACO' ? (
                            <><Ban className="w-3 h-3 text-orange-600" /> Celiaco</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3 text-green-600" /> General</>
                          )}
                        </div>
                        <p className="italic text-muted-foreground line-clamp-2">
                          "{plato.description}"
                        </p>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(p - 1, 1)); }} 
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages)); }} 
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
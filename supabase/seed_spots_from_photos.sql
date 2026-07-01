-- Carga inicial de las 28 cocheras (Puerta 1: Fila 1 y Fila 2 / Puerta 2: Fila 3 y Fila 4)
-- a partir de la lectura de la planilla física. monthly_fee queda en 0 para todos:
-- completar la cuota real de cada cliente desde la app antes de confiar en el dashboard.
-- Juan Pezua (cocheras 6 y 7) y Eslin Hernández (cocheras 8 y 15) tienen dos cocheras cada uno.
-- Varios clientes tienen más de un vehículo (patente secundaria) en la misma cochera.

with new_clients as (
  insert into public.clients (full_name, monthly_fee, notes) values
    ('Mijail del Pozo', 0, null),
    ('Enrique Correa', 0, null),
    ('Julio Lazo', 0, null),
    ('Gustavo Oriundo', 0, null),
    ('Luis Arestegui Cristian', 0, 'Inquilino'),
    ('Juan Pezua', 0, null),
    ('Eslin Hernández', 0, null),
    ('Carlos Pingo', 0, null),
    ('Luis García', 0, null),
    ('Milan Sánchez', 0, null),
    ('Gian Guevara', 0, 'Co-titular: Isela Pimentel'),
    ('Roxana Socla', 0, 'Hermano'),
    ('William Marín', 0, null),
    ('Jesús Fernández', 0, null),
    ('Milagros Garay', 0, null),
    ('Enzo Poma', 0, null),
    ('Paul', 0, 'Inquilino: Guido. Falta apellido de Paul.'),
    ('Jhon Cuscano', 0, null),
    ('Patricia Navarro', 0, null),
    ('Luz Livias', 0, 'Hijo'),
    ('Yani Arias', 0, 'Hija'),
    ('Mirtha Jaramillo', 0, null),
    ('Claribel', 0, 'Falta apellido.'),
    ('Eber Ponce', 0, null),
    ('Miguel Polo', 0, null)
  returning id, full_name
),
new_vehicles as (
  insert into public.vehicles (client_id, plate, description)
  select id, 'VCP-604', null from new_clients where full_name = 'Mijail del Pozo'
  union all
  select id, 'BJA-003', null from new_clients where full_name = 'Enrique Correa'
  union all
  select id, 'C4X-318', null from new_clients where full_name = 'Julio Lazo'
  union all
  select id, 'AEM-133', null from new_clients where full_name = 'Gustavo Oriundo'
  union all
  select id, 'D7F-866', null from new_clients where full_name = 'Luis Arestegui Cristian'
  union all
  select id, 'CBR-196', null from new_clients where full_name = 'Juan Pezua'
  union all
  select id, 'AYY-015', 'Inquilino, cochera 7' from new_clients where full_name = 'Juan Pezua'
  union all
  select id, 'PRO-H59', null from new_clients where full_name = 'Eslin Hernández'
  union all
  select id, '6408-7F', 'Moto, cochera 8' from new_clients where full_name = 'Eslin Hernández'
  union all
  select id, 'F3G-790', 'Camión' from new_clients where full_name = 'Carlos Pingo'
  union all
  select id, 'AFK-444', null from new_clients where full_name = 'Luis García'
  union all
  select id, 'ALV-746', 'Camión' from new_clients where full_name = 'Milan Sánchez'
  union all
  select id, 'CAJ-081', null from new_clients where full_name = 'Gian Guevara'
  union all
  select id, 'BNX-666', null from new_clients where full_name = 'Roxana Socla'
  union all
  select id, 'B2W-171', null from new_clients where full_name = 'William Marín'
  union all
  select id, 'AMV-464', null from new_clients where full_name = 'Jesús Fernández'
  union all
  select id, 'BXO-211', 'Alquilado' from new_clients where full_name = 'Jesús Fernández'
  union all
  select id, 'BCE-400', null from new_clients where full_name = 'Milagros Garay'
  union all
  select id, 'ACA-8H3', 'Furgón, tía' from new_clients where full_name = 'Milagros Garay'
  union all
  select id, 'C6V-359', null from new_clients where full_name = 'Enzo Poma'
  union all
  select id, 'ANI-550', null from new_clients where full_name = 'Paul'
  union all
  select id, 'CMV-542', null from new_clients where full_name = 'Jhon Cuscano'
  union all
  select id, 'CFH-518', null from new_clients where full_name = 'Patricia Navarro'
  union all
  select id, 'B2C-028', 'Cuñado' from new_clients where full_name = 'Patricia Navarro'
  union all
  select id, 'BZK-150', null from new_clients where full_name = 'Luz Livias'
  union all
  select id, 'A4R-276', null from new_clients where full_name = 'Yani Arias'
  union all
  select id, 'BTH-136', null from new_clients where full_name = 'Mirtha Jaramillo'
  union all
  select id, 'D3V-094', null from new_clients where full_name = 'Claribel'
  union all
  select id, 'CHY-391', 'Alquilado' from new_clients where full_name = 'Claribel'
  union all
  select id, 'CUR-021', null from new_clients where full_name = 'Eber Ponce'
  union all
  select id, 'B2G-540', 'Inquilino' from new_clients where full_name = 'Eber Ponce'
  union all
  select id, 'BV2-545', null from new_clients where full_name = 'Miguel Polo'
  returning id
)
insert into public.parking_spots (gate, row_label, row_order, position, spot_label, client_id, notes)
select 'PT1', 'Fila 1', 1, 1, '1', id, null from new_clients where full_name = 'Mijail del Pozo'
union all
select 'PT1', 'Fila 1', 1, 2, '2', id, null from new_clients where full_name = 'Enrique Correa'
union all
select 'PT1', 'Fila 1', 1, 3, '3', id, null from new_clients where full_name = 'Julio Lazo'
union all
select 'PT1', 'Fila 1', 1, 4, '4', id, null from new_clients where full_name = 'Gustavo Oriundo'
union all
select 'PT1', 'Fila 1', 1, 5, '5', id, null from new_clients where full_name = 'Luis Arestegui Cristian'
union all
select 'PT1', 'Fila 1', 1, 6, '6', id, null from new_clients where full_name = 'Juan Pezua'
union all
select 'PT1', 'Fila 1', 1, 7, '7', id, null from new_clients where full_name = 'Juan Pezua'
union all
select 'PT1', 'Fila 2', 2, 1, '8', id, null from new_clients where full_name = 'Eslin Hernández'
union all
select 'PT1', 'Fila 2', 2, 2, '9', id, null from new_clients where full_name = 'Carlos Pingo'
union all
select 'PT1', 'Fila 2', 2, 3, '10', null, null
union all
select 'PT1', 'Fila 2', 2, 4, '11', id, null from new_clients where full_name = 'Luis García'
union all
select 'PT1', 'Fila 2', 2, 5, '12', id, null from new_clients where full_name = 'Milan Sánchez'
union all
select 'PT1', 'Fila 2', 2, 6, '13', id, null from new_clients where full_name = 'Gian Guevara'
union all
select 'PT1', 'Fila 2', 2, 7, '14', id, null from new_clients where full_name = 'Roxana Socla'
union all
select 'PT2', 'Fila 3', 1, 1, '15', id, null from new_clients where full_name = 'Eslin Hernández'
union all
select 'PT2', 'Fila 3', 1, 2, '16', id, null from new_clients where full_name = 'William Marín'
union all
select 'PT2', 'Fila 3', 1, 3, '17', id, null from new_clients where full_name = 'Jesús Fernández'
union all
select 'PT2', 'Fila 3', 1, 4, '18', id, null from new_clients where full_name = 'Milagros Garay'
union all
select 'PT2', 'Fila 3', 1, 5, '19', id, null from new_clients where full_name = 'Enzo Poma'
union all
select 'PT2', 'Fila 3', 1, 6, '20', id, null from new_clients where full_name = 'Paul'
union all
select 'PT2', 'Fila 3', 1, 7, '21', id, null from new_clients where full_name = 'Jhon Cuscano'
union all
select 'PT2', 'Fila 4', 2, 1, '22', id, null from new_clients where full_name = 'Patricia Navarro'
union all
select 'PT2', 'Fila 4', 2, 2, '23', id, null from new_clients where full_name = 'Luz Livias'
union all
select 'PT2', 'Fila 4', 2, 3, '24', id, null from new_clients where full_name = 'Yani Arias'
union all
select 'PT2', 'Fila 4', 2, 4, '25', id, null from new_clients where full_name = 'Mirtha Jaramillo'
union all
select 'PT2', 'Fila 4', 2, 5, '26', id, null from new_clients where full_name = 'Claribel'
union all
select 'PT2', 'Fila 4', 2, 6, '27', id, null from new_clients where full_name = 'Eber Ponce'
union all
select 'PT2', 'Fila 4', 2, 7, '28', id, null from new_clients where full_name = 'Miguel Polo';

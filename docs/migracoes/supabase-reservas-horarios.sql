DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.reservas
        GROUP BY id_quadra, dia_reserva, horaio
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem horários duplicados em reservas. Resolva as duplicidades antes de executar esta migração.';
    END IF;
END $$;

ALTER TABLE public.reservas
ADD COLUMN IF NOT EXISTS grupo_reserva uuid;

UPDATE public.reservas
SET grupo_reserva = gen_random_uuid()
WHERE grupo_reserva IS NULL;

ALTER TABLE public.reservas
ALTER COLUMN grupo_reserva SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reservas_quadra_data_horario_unico
ON public.reservas (id_quadra, dia_reserva, horaio);

NOTIFY pgrst, 'reload schema';
ALTER TABLE public.quadras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quadras visiveis publicamente" ON public.quadras;
CREATE POLICY "Quadras visiveis publicamente"
ON public.quadras
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Socios podem cadastrar quadras" ON public.quadras;
CREATE POLICY "Socios podem cadastrar quadras"
ON public.quadras
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.usuarios AS usuario
        WHERE lower(usuario.email) = lower((SELECT auth.jwt() ->> 'email'))
            AND usuario.socio IS TRUE
            AND usuario.id = id_usuario
    )
);

NOTIFY pgrst, 'reload schema';
export const esportes = [
    {
        nome: "Futebol",
        icone: "⚽",
        descricao: "Encontre campos e horários para montar sua partida.",
        valor: "futebol",
        aliases: [],
        tema: "futebol",
        paleta: ["#0c6a30", "#167d41", "#22c55e", "#4ade80", "#86efac"],
    },
    {
        nome: "Fut-vôlei",
        icone: "🏐",
        descricao: "Jogue na areia usando os pés, a cabeça e muita habilidade.",
        valor: "futvolei",
        aliases: ["fut-vôlei", "fut volei"],
        tema: "futvolei",
        paleta: ["#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c"],
    },
    {
        nome: "Tennis",
        icone: "🎾",
        descricao: "Escolha uma quadra e reserve seu horário.",
        valor: "tennis",
        aliases: ["tênis", "tenis"],
        tema: "tennis",
        paleta: ["#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"],
    },
    {
        nome: "BeachTennis",
        icone: "🏖️",
        descricao: "Pratique na areia com quem você gosta.",
        valor: "beachtennis",
        aliases: ["beach tennis", "beach tênis", "beachtenis"],
        tema: "beachtennis",
        paleta: ["#854d0e", "#a16207", "#ca8a04", "#eab308", "#facc15"],
    },
];


const nomesEsportesAntigos = {
    futsal: "Futsal",
    basquete: "Basquete",
    volei: "Vôlei",
};

function normalizarChave(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function encontrarEsporte(valor) {
    const chave = normalizarChave(valor);
    return esportes.find((esporte) => [esporte.valor, ...esporte.aliases]
        .some((alias) => normalizarChave(alias) === chave));
}

export function chaveEsporte(valor) {
    return encontrarEsporte(valor)?.valor || normalizarChave(valor);
}

export function nomeDoEsporte(valor) {
    const esporte = encontrarEsporte(valor);
    if (esporte) return esporte.nome;

    const chave = normalizarChave(valor);
    return nomesEsportesAntigos[chave] || String(valor || "").trim();
}

export const temaNeutro = {
    nome: "Todos os Esportes",
    descricao: "Todas as modalidades esportivas.",
    valor: "todos",
    aliases: ["todos", "todas"],
    tema: "todos",
    paleta: ["#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"],
};

export function obterTemaEsporte(valor) {
    const chave = chaveEsporte(valor);
    if (!chave || chave === "todos") return temaNeutro;
    return esportes.find((esporte) => esporte.valor === chave) || temaNeutro;
}
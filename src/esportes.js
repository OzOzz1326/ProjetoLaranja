export const esportes = [
    {
        nome: "Futebol",
        descricao: "Encontre campos e horários para montar sua partida.",
        valor: "futebol",
        aliases: [],
        tema: "futebol",
        paleta: ["#0c6a30", "#167d41", "#2c9e57", "#57c785", "#8be0aa"],
    },
    {
        nome: "Fut-vôlei",
        descricao: "Jogue na areia usando os pés, a cabeça e muita habilidade.",
        valor: "futvolei",
        aliases: ["fut-vôlei", "fut volei"],
        tema: "futvolei",
        paleta: ["#a98307", "#d4a202", "#efb807", "#fdc516", "#ffd03a"],
    },
    {
        nome: "Tennis",
        descricao: "Escolha uma quadra e reserve seu horário.",
        valor: "tennis",
        aliases: ["tênis", "tenis"],
        tema: "tennis",
        paleta: ["#062443", "#17496f", "#326f9c", "#5f99bc", "#a0cbe0"],
    },
    {
        nome: "BeachTennis",
        descricao: "Pratique na areia com quem você gosta.",
        valor: "beachtennis",
        aliases: ["beach tennis", "beach tênis", "beachtenis"],
        tema: "beachtennis",
        paleta: ["#8d4925", "#b96e48", "#e28000", "#ff9800", "#ffc340"],
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

export function obterTemaEsporte(valor) {
    const chave = chaveEsporte(valor);
    return esportes.find((esporte) => esporte.valor === chave) || esportes[0];
}
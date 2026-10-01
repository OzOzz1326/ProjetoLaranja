export const esportes = [
    {
        nome: "Futebol",
        descricao: "Encontre campos e horários para montar sua partida.",
        icone: "",
        valor: "futebol",
        aliases: [],
    },
    {
        nome: "Fut-vôlei",
        descricao: "Jogue na areia usando os pés, a cabeça e muita habilidade.",
        icone: "",
        valor: "futvolei",
        aliases: ["fut-vôlei", "fut volei"],
    },
    {
        nome: "Tennis",
        descricao: "Escolha uma quadra e reserve seu horário.",
        icone: "",
        valor: "tennis",
        aliases: ["tênis", "tenis"],
    },
    {
        nome: "BeachTennis",
        descricao: "Pratique na areia com quem você gosta.",
        icone: "",
        valor: "beachtennis",
        aliases: ["beach tennis", "beach tênis", "beachtenis"],
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
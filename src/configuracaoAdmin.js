const CHAVE_PAGAMENTO_TESTE = "pagamentoTesteAtivo";
const EVENTO_PAGAMENTO_TESTE = "pagamento-teste-alterado";
const emailAdministrador = (import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

export function usuarioEhAdministrador(email) {
	return Boolean(emailAdministrador && email?.trim().toLowerCase() === emailAdministrador);
}

export function pagamentoTestePermitido() {
	return import.meta.env.VITE_PAGAMENTO_TESTE_ATIVO !== "false";
}

export function lerPagamentoTesteAtivo() {
	if (!pagamentoTestePermitido()) return false;

	const valorSalvo = localStorage.getItem(CHAVE_PAGAMENTO_TESTE);
	return valorSalvo === null ? true : valorSalvo === "true";
}

export function definirPagamentoTesteAtivo(ativo) {
	localStorage.setItem(CHAVE_PAGAMENTO_TESTE, String(ativo && pagamentoTestePermitido()));
	window.dispatchEvent(new Event(EVENTO_PAGAMENTO_TESTE));
}

export function eventoPagamentoTeste() {
	return EVENTO_PAGAMENTO_TESTE;
}
import { Link } from "react-router-dom";
import "./Sobre.css";

function Sobre({ embutido = false }) {
	const ElementoRaiz = embutido ? "section" : "main";

	return (
		<ElementoRaiz id="pagina-sobre">
			<section className="hero-sobre" aria-labelledby="titulo-sobre">
				<div className="conteudo-hero-sobre">
					<p className="etiqueta-sobre">SPORT IN CITY</p>
					<h1 id="titulo-sobre">O esporte acontece quando a cidade se encontra.</h1>
					<p>Uma plataforma para aproximar pessoas, modalidades e espaços esportivos.</p>
				</div>
			</section>

			<hr className="divisor-sobre" />
			<h2 className="titulo-secao-sobre">Sobre nós</h2>

			<div className="conteudo-sobre">
				<section className="introducao-sobre" aria-labelledby="titulo-proposta-sobre">
					<p className="marcador-sobre">NOSSA IDEIA</p>
					<div>
						<h2 id="titulo-proposta-sobre">Deixar o próximo jogo mais perto.</h2>
						<p>
							O Sport In City é um projeto que conecta quem quer praticar esportes
							aos espaços disponíveis na cidade. A proposta é facilitar a busca por
							quadras e ajudar cada pessoa a encontrar um lugar para jogar.
						</p>
					</div>
				</section>

				<section className="publicos-sobre" aria-label="Para quem é o Sport In City">
					<article>
						<p className="marcador-sobre">01 / PARA JOGADORES</p>
						<h3>Encontre espaço para jogar.</h3>
						<p>Explore modalidades, conheça quadras e consulte informações para planejar sua partida.</p>
					</article>
					<article>
						<p className="marcador-sobre">02 / PARA PROPRIETÁRIOS</p>
						<h3>Mostre o que sua quadra oferece.</h3>
						<p>Apresente seu espaço, modalidades, horários e serviços para chegar a mais pessoas.</p>
					</article>
				</section>

				<section className="chamada-sobre" aria-labelledby="titulo-chamada-sobre">
					<div>
						<p className="marcador-sobre">FAÇA PARTE</p>
						<h2 id="titulo-chamada-sobre">Vamos colocar a cidade em movimento?</h2>
					</div>
					<div className="acoes-sobre">
						<Link className="botao-sobre botao-principal-sobre" to="/quadras">Explorar quadras</Link>
						<Link className="botao-sobre botao-secundario-sobre" to="/contato">Cadastre uma quadra</Link>
					</div>
				</section>
			</div>
		</ElementoRaiz>
	);
}

export default Sobre;

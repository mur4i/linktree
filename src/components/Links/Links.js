import "./Links.css";

function Links () {

    const LinksTable = [
        { id: 1 , urlNome: "Github", url: "https://github.com/mur4i"},
        { id: 2 , urlNome: "Discord", url: "https://discordapp.com/users/600843526825181219"},
        { id: 3 , urlNome: "QBCore Brasil", url: "https://discord.gg/uEfGD4mmVh"},
        { id: 4 , urlNome: "Agendar", url: "https://calendly.com/mur444i/consultoria"}
    ]

    const LinksHtml = LinksTable.map((props) => {
        return (
        <div key={props.id} className="conteudo_links">
            <a href={props.url}>{props.urlNome}</a>
        </div>
        );
    })

    return (
        <>
            {LinksHtml}
        </>
    );
}

export default Links;

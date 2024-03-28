export default function NonModeratorPage() {
    return (
        <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
            <h2 style={{fontSize: '1.4rem', margin: "2rem 0"}}>🇫🇷 Il faut être modérateur pour acceder à cette page. </h2>
            <h2 style={{fontSize: '1.4rem', margin: "2rem 0"}}>🇺🇸 / 🇬🇧 You have to be moderator to access to this page. </h2> 
        </div>
    )
}
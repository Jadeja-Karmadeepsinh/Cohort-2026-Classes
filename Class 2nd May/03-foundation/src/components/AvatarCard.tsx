function AvatarCard({avatar, level = "null"}) {
    return (
    <article>
        <div>{avatar.initial}</div>
        <h3>{avatar.name}</h3>
        <p>{avatar.role}</p>
        <p>Level: {level}</p>
    </article>
    )
}

export default AvatarCard;
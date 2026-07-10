type GreetingProps={
    name:string,
}

export default function Greeting({name}: GreetingProps){
    return(
        <div>
            <h1>Hello {name} ✌️</h1>
        </div>
    )
}
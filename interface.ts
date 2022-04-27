export interface tenant {
    id: string, // discord api id number unique per user
    name: string, // name to appear when bot interacts
    ft: number, // number of square feet
    money: number, // amount of money owned
    worked: boolean, // whether the person has worked in the past hour
    gambleCount: number // number of times gambled in the past hour
}
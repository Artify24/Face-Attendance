import { redirect } from "next/navigation";

const page = () => {
    return redirect("/dashboard/add-student");
}

export default page
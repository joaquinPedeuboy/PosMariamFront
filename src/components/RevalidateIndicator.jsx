import useRevalidateStatus from "../hooks/useRevalidateStatus";

export default function RevalidateIndicator() {
    const loading = useRevalidateStatus();

    if (!loading) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white shadow-xl rounded-full p-3 z-50">
            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
    );
}

import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";


type Props = {
    visible: boolean;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    icon?: React.ReactNode;
    label?: string;
    confirmStyles?: {};
}

export default function AlertComponent({ message, onConfirm, onCancel, visible, icon, label, confirmStyles }: Props) {
    return (
        <Modal visible={visible} animationType="fade" transparent>

            <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} />


            <View style={styles.box}>

                {icon && <View style={{ marginBottom: 10 }}>{icon}</View>}

                <Text style={styles.message}>{message}</Text>
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.confirmButton, confirmStyles]} onPress={onConfirm}>
                        <Text style={styles.buttonText}>{label || 'Confirm'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    box: {
        position: "absolute",
        top: '40%',
        height: 'auto',
        backgroundColor: '#f5f2eeff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 15,
        width: '85%',
        left: '7.5%',
        right: '7.5%',
        zIndex: 1000,
        padding: 15,
        paddingTop: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    message: {
        fontSize: 16,
        fontFamily: "Lato_400Regular",
        color: 'black',
        fontWeight: "600",
        marginBottom: 30,
        textAlign: "center",
    },
    buttons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 10
    },
    cancelButton: {
        backgroundColor: '#e7d5c4ff',
        width: '45%',
        borderRadius: 10,
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmButton: {
        backgroundColor: '#C4956A',
        width: '45%',
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 15,
        fontFamily: "Lato_400Regular",
        color: 'black',
        fontWeight: "bold",
    }
});
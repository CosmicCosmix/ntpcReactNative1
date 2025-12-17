import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00B9A9',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 185, 169, 0.75)',
    },
    background: {
        flex: 1,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 40,
        justifyContent: 'space-between',
    },
    topTextContainer: {
        marginTop: 20,
    },
    topText: {
        fontSize: 35,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 40,
    },
    topTextBlue: {
        fontSize: 35,
        fontWeight: '700',
        color: '#00B9A9',
        lineHeight: 40,
    },
    bottomLogoContainer: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    bottomLogo: {
        width: 140,
        height: 100,
    },
    logoContainer: {
        marginBottom: 12,
    },
    logo: {
        width: 180,
        height: 60,
    },
    cardContainer: {
        flex: 1.2,
        justifyContent: 'flex-end',
    },
    glassWrapper: {
        marginHorizontal: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.90)',
    },
    androidGlassFallback: {
        backgroundColor: 'rgba(255,255,255,0.90)',
    },
    grainOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.08)',
        opacity: 0.4,
    },
    cardInner: {
        paddingTop: 32,
        paddingHorizontal: 0,
        paddingBottom: 36,
        minHeight: 350,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 18,
    },
    cardContent: {
        overflow: 'hidden',
    },
    screenContainer: {
        flexDirection: 'row',
        width: width * 2,
    },
    screen: {
        width: width,
        paddingHorizontal: HORIZONTAL_PADDING,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    backButton: {
        paddingVertical: 4,
        paddingRight: 12,
        marginLeft: -4,
    },
    backArrow: {
        fontSize: 26,
        color: '#111827',
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111827',
        marginBottom: 6,
    },
    titleWithBack: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
        marginRight: 38,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    signUpLink: {
        color: '#00B9A9',
        fontWeight: '600',
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#9CA3AF',
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 3,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
        color: '#9CA3AF',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        paddingVertical: 12,
        fontWeight: '400',
    },
    button: {
        backgroundColor: '#00B9A9',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#00B9A9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: '#9EE3DC',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export { HORIZONTAL_PADDING };
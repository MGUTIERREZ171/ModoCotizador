import React, { useEffect, useRef, useState } from 'react';
import '../styles/cotizacionScreen.css'
import Swal from 'sweetalert2';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { boxClasses, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import 'dayjs/locale/es';
import { NavBar } from '../components/NavBar';

dayjs.locale('es');

export const CotizacionScreen = ({ obtenerCreditos }) => {
    const [cliente, setCliente] = useState('');
    const [cantidadAutorizada, setCantidadAutorizada] = useState('');
    const [fechaPrestamo, setFechaPrestamo] = useState(null);
    const [meses, setMeses] = useState('');
    const [interes, setInteres] = useState('');
    const [isReadonly, setIsReadonly] = useState(false);
    const [isInteresEditable, setIsInteresEditable] = useState(false);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [fechaFinalizacion, setFechaFinalizacion] = useState(null);
    const [fechaPrimerPago, setFechaPrimerPago] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [montoTotal, setMontoTotal] = useState(0);
    const [ncredito, setNcredito] = useState('');
    const [cantidadInteres, setCantidadInteres] = useState(0);
    const [errors, setErrors] = useState({
        ncredito: false,
        cliente: false,
        cantidadAutorizada: false,
        meses: false,
        interes: false,
        fechaPrestamo: false,
    });

    // Referencias para cada campo
    const ncreditoRef = useRef(null);
    const clienteRef = useRef(null);
    const montoRef = useRef(null);
    const mesesRef = useRef(null);
    const interesRef = useRef(null);
    const fechaPrestamoRef = useRef(null);

    const ajustarFechaPago = (fecha) => {
        const day = fecha.date();
        if (day < 1) {
            return fecha.date(1);
        } else if (day < 16) {
            return fecha.date(16);
        } else {
            return fecha.add(1, 'month').date(1);
        }
    };

    const calcularFechaFinalizacion = (fechaPrestamo, meses) => {
        if (!fechaPrestamo || !meses) return null;
        // Sumamos los meses seleccionados a la fecha de préstamo
        const fechaFinal = dayjs(fechaPrestamo).add(meses, 'month');
        return fechaFinal;
    };

    const redondearDocena = (cantidad) => Math.ceil(cantidad / 10) * 10;

    const calcularPagos = () => {
        const pagosCalculados = [];
        const montoAutorizado = Math.round(parseFloat(cantidadAutorizada));
        const interesValor = Math.round(parseFloat(interes));

        if (isNaN(montoAutorizado) || isNaN(interesValor)) {
            console.error('Valores inválidos para el cálculo de los pagos');
            return;
        }

        const totalInteres = (montoAutorizado * (meses * (interesValor / 100)));
        setCantidadInteres(totalInteres)

        const montoTotal = montoAutorizado + totalInteres;
        setMontoTotal(montoTotal);

        const pagosTotales = meses * 2; // Número total de pagos quincenales
        const pagoQuincenalBruto = montoTotal / pagosTotales; // Pago base antes del redondeo
        const pagoQuincenal = redondearDocena(pagoQuincenalBruto); // Pago redondeado
        const montoPagadoParcial = pagoQuincenal * (pagosTotales - 1); // Suma de todos los pagos excepto el último
        const ultimoPago = montoTotal - montoPagadoParcial; // Ajuste para el último pago

        let fechaPago = ajustarFechaPago(dayjs(fechaPrestamo));
        setFechaPrimerPago(fechaPago);

        for (let i = 1; i <= pagosTotales; i++) {
            const fechaPagoActual = fechaPago.format('DD/MM/YYYY');
            const importePago = i === pagosTotales ? ultimoPago : pagoQuincenal; // Ajuste para el último pago

            pagosCalculados.push({
                npago: i,
                fecha: fechaPagoActual,
                importe: importePago.toFixed(2),
                saldoActual: importePago.toFixed(2),
                vencido: 0.0,
                status: 'Pendiente',
            });

            // Ajustar la fecha al día 1 o 16 del siguiente periodo
            fechaPago = fechaPago.date() === 1 ? fechaPago.date(16) : fechaPago.add(1, 'month').date(1);
        }

        setPagos(pagosCalculados);
        console.log(pagosCalculados)
    };

    const onSubmit = (event) => {
        event.preventDefault();

        // Validar cada campo y actualizar los errores
        const newErrors = {
            ncredito: parseFloat(ncredito) <= 0,
            cliente: !cliente,
            cantidadAutorizada: !cantidadAutorizada || parseFloat(cantidadAutorizada) <= 0,
            meses: !meses || isNaN(meses) || parseInt(meses) <= 0,
            interes: !interes,
            fechaPrestamo: !fechaPrestamo || !dayjs(fechaPrestamo).isValid(), // Valida que sea una fecha válida
        };

        setErrors(newErrors);

        // Establece el foco en el primer campo con error
        if (newErrors.ncredito) {
            ncreditoRef.current.focus();
        } else if (newErrors.cliente) {
            clienteRef.current.focus();
        } else if (newErrors.cantidadAutorizada) {
            montoRef.current.focus();
        } else if (newErrors.meses) {
            mesesRef.current.focus();
        } else if (newErrors.interes) {
            interesRef.current.focus();
        } else if (newErrors.fechaPrestamo) {
            fechaPrestamoRef.current.focus();
        } else {
            // Si no hay errores, realiza los cálculos o acciones necesarias
            calcularPagos();
            const nuevaFechaFinalizacion = calcularFechaFinalizacion(fechaPrestamo, meses);
            setFechaFinalizacion(nuevaFechaFinalizacion);
        }
    };

    const LimpiarInputs = () => {
        setCliente('');
        setCantidadAutorizada('');
        setFechaFinalizacion(null)
        setFechaPrestamo(null)
        setMeses('');
        setInteres('')
        setIsInteresEditable(false);
        setFechaPrimerPago(null)
        setPagos([])
        setMontoTotal(0)
        setNcredito('');
        setErrors({ cliente: false, meses: false, fechaPrestamo: false });
        setIsReadonly(false)
        setIsPasswordCorrect(false)
    }

    const handleInteresClick = async () => {
        if (!isPasswordCorrect) {
            // Mostrar SweetAlert2 para ingresar contraseña
            const { value: password } = await Swal.fire({
                title: 'Introduzca la contraseña',
                input: 'password',
                inputPlaceholder: 'Ingrese la contraseña',
                inputAttributes: {
                    maxlength: '20',
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'btn btn-primary me-2',
                    cancelButton: 'btn btn-secondary'
                },
                buttonsStyling: false
            });

            if (password) {
                // Validar la contraseña ingresada
                if (password === 'Ins0lux.') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contraseña correcta',
                        text: 'Ahora puedes editar el campo.',
                        timer: 800,
                        showConfirmButton: false
                    });
                    setIsPasswordCorrect(true);
                    setIsInteresEditable(true);
                } else {

                    Swal.fire({
                        icon: 'error',
                        title: 'Contraseña incorrecta',
                        text: 'Intente de nuevo.',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            }
        }
    };


    const crearPDF = () => {
        const doc = new jsPDF();

        // Configurar el tamaño y tipo de letra para el texto del cliente
        doc.setFontSize(16); // Cambia el tamaño de letra a 16
        doc.setFont("helvetica", "bold"); // Cambia el tipo de letra a Helvetica y estilo negrita
        doc.text(`Cliente: ${cliente}`, 20, 14);

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text('Pagos', 20, 23);

        // Definir las columnas y los datos de la tabla
        const columns = ['N° Pago', 'Fecha', 'Importe', 'Saldo Actual', 'Vencido', 'Status'];
        const data = pagos.map(pag => [
            pag.npago,
            pag.fecha,
            ` $${parseFloat(pag.importe).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ` $${parseFloat(pag.saldoActual).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ` $${parseFloat(pag.vencido).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            pag.status
        ]);

        // Agregar la fila del total debajo de "Saldo Actual"
        const totalRow = ['', '', 'Total:', `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,];
        data.push(totalRow);

        // Cálculos de la tabla para centrarla
        const tableWidth = 170; // Ancho total de la tabla en mm
        const pageWidth = doc.internal.pageSize.getWidth(); // Ancho de la página
        const marginLeft = (pageWidth - tableWidth) / 2; // Margen izquierdo para centrar la tabla

        // Dibujar la tabla en el PDF
        doc.autoTable({
            startY: 26,
            head: [columns],
            body: data,
            theme: 'striped',
            headStyles: {
                fillColor: [0, 102, 204], // Color de fondo para el encabezado
                halign: 'center', // Centrar el texto del encabezado
            },
            styles: {
                cellPadding: 3,
                fontSize: 11,
                fontStyle: 'bold',
                tableWidth: 400,
                halign: 'right', // Alinear el contenido de las celdas a la derecha
                valign: 'middle', // Centrar verticalmente
            },
            columnStyles: {
                0: { cellWidth: 25 }, // Ajusta el ancho de cada columna para una separación uniforme
                1: { cellWidth: 36 },
                2: { cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { cellWidth: 25 },
                5: { cellWidth: 30 }
            },
            // Ajusta el margen izquierdo para centrar la tabla
            margin: { left: marginLeft }
        });

        // Convertir el documento PDF a un Blob y abrirlo en una nueva pestaña
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    };

    const handleNCreditoChange = (event) => {
        setNcredito(event.target.value);
    };

    const handleObtenerCredito = async () => {

        const data = await obtenerCreditos(ncredito);

        if (data) {
            // Actualiza los estados con los datos obtenidos
            setCliente(data.nombreCompleto || '');
            setCantidadAutorizada(data.monto || '');
            setMeses(data.meses || '');
            setInteres(data.interes || '');
            const fechaValida = dayjs(data.fechaPrestamo);
            setFechaPrestamo(fechaValida.isValid() ? fechaValida : null);
            setIsReadonly(true);


            setErrors((prevErrors) => ({
                ...prevErrors,
                ncredito: false,  // Si los datos son correctos, elimina el error del campo ncredito
                cliente: !data.nombreCompleto,
                cantidadAutorizada: !data.monto || parseFloat(data.monto) <= 0,
                meses: !data.meses || isNaN(data.meses) || parseInt(data.meses) <= 0,
                interes: !data.interes,
                fechaPrestamo: !(data.fechaPrestamo && dayjs(data.fechaPrestamo).isValid()), // Valida que la fecha sea correcta
            }));

        } else {
            // Si no se reciben datos, seguir con los errores
            setErrors((prevErrors) => ({
                ...prevErrors,
                ncredito: true,  // Asegúrate de que el error persista si no hay datos
            }));
        }
    };
    // console.log({
    //     pagos,
    //     interes,
    //     fechaPrimerPago,
    //     fechaPrestamo,
    //     fechaFinalizacion
    // });


    const actualizarAbonos = async (idCredito, pagos) => {
        const token = localStorage.getItem('token'); // Obtener el token

        // Verificar si el token existe, si no, redirigir al login
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Se agotó el tiempo de tu sesión',
                text: 'Vuelve a iniciar sesión',
                showConfirmButton: true
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            return null;
        }

        const idUsuario = localStorage.getItem('idUsuario'); // Obtener el idUsuario del localStorage

        if (!idUsuario) {
            Swal.fire('Error', 'No se ha encontrado el ID del usuario. Por favor, inicie sesión.', 'error');
            return;
        }

        if (!idCredito) {
            Swal.fire('Crédito no ingresado', 'Aún no has ingresado un número de crédito', 'warning');
            return;
        }

        if (!pagos || pagos.length === 0) {
            Swal.fire('Falta tabla de pagos', 'Debe generar la tabla de pagos antes de actualizar.', 'warning');
            return;
        }

        try {
            // Mostrar alerta de confirmación
            const result = await Swal.fire({
                title: "¿Estás seguro de actualizar los abonos para este crédito?",
                text: "Esta acción modificará los abonos programados.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#170250",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, actualizar",
                cancelButtonText: "Cancelar"
            });

            if (!result.isConfirmed) {
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/actualizar-abonos/${idCredito}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token,
                },
                body: JSON.stringify({
                    pagos,
                    idUsuario,
                    interes,
                    cantidadInteres,
                    fechaPrimerPago,
                    fechaPrestamo,
                    fechaFinalizacion,
                    meses,
                }),
            });

            console.log({
                pagos,
                idUsuario,
                interes,
                cantidadInteres,
                fechaPrimerPago,
                fechaPrestamo,
                fechaFinalizacion,
                meses,
            });

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Abonos actualizados correctamente',
                    showConfirmButton: true,
                });
                LimpiarInputs();
            } else if (response.status === 401) {
                // Si el token es inválido o expiró
                Swal.fire({
                    icon: 'error',
                    title: 'Se agotó el tiempo de tu sesión',
                    text: 'Vuelve a iniciar sesión',
                    showConfirmButton: true,
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Error al actualizar los abonos.', 'error');
            }
        } catch (error) {
            console.error('Error al actualizar los abonos:', error);
            Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
        }
    };


    // useEffect(() => {
    //     if (cliente && cantidadAutorizada && fechaPrestamo && meses && interes) {
    //         // Aquí puedes llamar a la función `actualizarAbonos` solo cuando los valores estén completos.
    //         actualizarAbonos(pagos, interes, fechaPrimerPago, fechaPrestamo, fechaFinalizacion);
    //     }
    // }, [cliente, cantidadAutorizada, fechaPrestamo, meses, interes, fechaPrimerPago, fechaFinalizacion]); // Asegura que todos los estados estén listos


    return (
        <>
            <NavBar />
            <div
                style={{
                    backgroundColor: '#f0f0f0',
                    padding: '20px',
                    width: '100%',
                    textAlign: 'center'
                }}
            >
                <h1
                    style={{
                        color: '##170250',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        margin: 0,
                    }}
                >
                    COTIZADOR
                </h1>
            </div>


            <div style={{ backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: '100vh', padding: '20px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', flexWrap: 'wrap', gap: '16px', width: '100%', }}>
                        <div style={{ display: 'flex', gap: '16px', maxWidth: '100%', flexWrap: 'wrap' }}>
                            <FormControl>
                                <TextField
                                    id="ncliente"
                                    label="N.Credito"
                                    variant="outlined"
                                    type="number"
                                    value={ncredito}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleObtenerCredito(); // Llama a la función cuando se presiona Enter
                                        }
                                    }}
                                    onChange={handleNCreditoChange}
                                    sx={{ width: '120px', backgroundColor: '#FFFF' }}
                                    inputRef={ncreditoRef}
                                    error={errors.ncredito}
                                    fullWidth
                                    disabled={isReadonly}
                                />
                                {errors.ncredito && <FormHelperText sx={{ color: 'red' }}>Campo Obligatorio</FormHelperText>}
                            </FormControl>

                            <button type="button" className="btn btn-search m" onClick={handleObtenerCredito} style={{
                                width: '30px', // Ajusta el tamaño fijo para que no cambie
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                backgroundColor: '#170250',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                height: 'fit-content',
                            }}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>

                            <FormControl>
                                <TextField
                                    id="cliente"
                                    label="Nombre Cliente"
                                    variant="outlined"
                                    value={cliente}
                                    onChange={(e) => setCliente(e.target.value)}
                                    sx={{ width: '330px', backgroundColor: '#FFFF' }}
                                    inputRef={clienteRef} // Referencia para cliente
                                    error={errors.cliente}
                                    disabled  // Deshabilita el campo si es de solo lectura
                                // helperText={errors.cliente ? "Campo Obligatorio" : ""}
                                // fullWidth
                                />
                                {errors.cliente && <FormHelperText sx={{ color: 'red' }}>Campo Obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl>
                                <TextField
                                    id="cantidadAutorizada"
                                    type="number"
                                    label="Monto"
                                    variant="outlined"
                                    value={cantidadAutorizada}
                                    onChange={(e) => {
                                        setCantidadAutorizada(e.target.value);
                                        setErrors((prev) => ({ ...prev, cantidadAutorizada: false }));
                                    }}
                                    sx={{ width: '120px', backgroundColor: '#FFFF' }}
                                    inputRef={montoRef} // Referencia para cliente
                                    error={errors.cantidadAutorizada}
                                    disabled  // Deshabilita el campo si es de solo lectura
                                // helperText={errors.meses ? "Campo Obligatorio" : ""}
                                // fullWidth
                                />

                                {errors.cantidadAutorizada && <FormHelperText sx={{ color: 'red' }} > Campo Obligatorio</FormHelperText>}

                            </FormControl>

                            <FormControl>
                                <InputLabel id="demo-simple-select-label">Meses</InputLabel>
                                <Select
                                    id="meses"
                                    label="Meses"
                                    variant="outlined"
                                    value={meses}
                                    onChange={(e) => {
                                        setMeses(e.target.value);
                                        setErrors((prev) => ({ ...prev, meses: false }));
                                    }}
                                    fullWidth
                                    sx={{ width: '120px', backgroundColor: '#FFFF' }}
                                    inputRef={mesesRef}
                                    error={errors.meses}
                                    disabled={!isReadonly}  // Deshabilita el campo si es de solo lectura
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                                    ))}
                                </Select>
                                {errors.meses && <FormHelperText sx={{ color: 'red' }}>Campo Obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl >
                                <TextField
                                    id="interes"
                                    type="number"
                                    label="Interés (%)"
                                    variant="outlined"
                                    value={interes}
                                    onChange={(e) => {
                                        setInteres(e.target.value);
                                        setErrors((prev) => ({ ...prev, interes: false }));
                                    }}
                                    onDoubleClick={handleInteresClick}
                                    sx={{ width: '100px', backgroundColor: '#FFFF' }}
                                    inputRef={interesRef}
                                    error={errors.interes}
                                    fullWidth
                                    disabled={!isReadonly}
                                    InputProps={{
                                        readOnly: !isInteresEditable,
                                    }}
                                />
                                {errors.interes && <FormHelperText sx={{ color: 'red' }}>Campo Obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl>
                                <DatePicker
                                    value={fechaPrestamo ? dayjs(fechaPrestamo) : null} // Asegúrate de que sea una fecha válida o null
                                    onChange={(newValue) => {
                                        setFechaPrestamo(newValue);

                                        // Limpia el error de fecha si se modifica el valor
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            fechaPrestamo: false, // Elimina el error si se cambia la fecha
                                        }));
                                    }}
                                    label="Fecha de Préstamo"
                                    format="DD/MM/YYYY"
                                    disabled  // Deshabilita el campo si es de solo lectura
                                    // minDate={dayjs()}
                                    sx={{
                                        width: '195px',
                                        backgroundColor: '#FFFF',
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: errors.fechaPrestamo ? 'red' : 'default',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: errors.fechaPrestamo ? 'red' : 'default',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: errors.fechaPrestamo ? 'red' : 'default',
                                            },
                                        },
                                    }}
                                />
                                {errors.fechaPrestamo && (
                                    <FormHelperText sx={{ color: 'red' }}>Campo Obligatorio</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl>
                                <DatePicker
                                    value={fechaPrimerPago}
                                    onChange={(newValue) => setFechaPrimerPago(newValue)}
                                    label="Fecha del Primer Pago"
                                    readOnly
                                    disabled
                                    format="DD/MM/YYYY"
                                    sx={{ width: '220px', backgroundColor: '#FFFF' }}
                                />
                            </FormControl>

                            <FormControl>
                                <DatePicker
                                    value={fechaFinalizacion}
                                    onChange={(newValue) => setFechaFinalizacion(newValue)}
                                    label="Fecha de Finalización"
                                    readOnly
                                    disabled
                                    format="DD/MM/YYYY"
                                    sx={{ width: '215px', backgroundColor: '#FFFF' }}
                                />
                            </FormControl>

                        </div>
                    </div>
                </LocalizationProvider >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                    }}
                >
                    <div className="d-flex justify-content-end align-items-center custom-buttons mt-1" style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '1200px',
                    }}>
                        <button type="button" className="btn btn-custom m " onClick={onSubmit}>
                            <i className="fa-solid fa-check"></i>
                            <span> Calcular</span>
                        </button>
                        <button type="button" className="btn btn-custom m " onClick={crearPDF}>
                            <i className="fa-solid fa-print"></i>
                            <span> Imprimir</span>
                        </button>
                        <button type="button" className="btn btn-custom-act m " onClick={() => actualizarAbonos(ncredito, pagos)}>
                            <i className="fa-solid fa-floppy-disk"></i>
                            <span> Actualizar</span>
                        </button>
                        <button type="button" className="btn btn-custom m" onClick={LimpiarInputs} style={{ marginLeft: '11px' }}>
                            <i className="fa-solid fa-rotate-right"></i>
                            <span> Limpiar</span>
                        </button>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
                        <Paper sx={{ width: '90%', maxWidth: 1400 }}>
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px', borderRight: '1px solid white' }}>N.PAGO</TableCell>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px', borderRight: '1px solid white' }}>FECHA</TableCell>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px', borderRight: '1px solid white' }}>IMPORTE</TableCell>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px', borderRight: '1px solid white' }}>SALDO ACTUAL</TableCell>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px', borderRight: '1px solid white' }}>VENCIDO</TableCell>
                                            <TableCell align='center' sx={{ fontWeight: 'bold', backgroundColor: '#170250', color: 'white', padding: '8px' }}>STATUS</TableCell>
                                        </TableRow>

                                    </TableHead>
                                    <TableBody>
                                        {pagos.map((pago, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                                                    '&:hover': { backgroundColor: '#e0e0e0' }
                                                }}
                                            >
                                                <TableCell align='right' sx={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>{pago.npago}</TableCell>
                                                <TableCell align='right' sx={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>{pago.fecha}</TableCell>
                                                <TableCell align='right' sx={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>${parseFloat(pago.importe).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align='right' sx={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>${parseFloat(pago.saldoActual).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align='right' sx={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>${parseFloat(pago.vencido).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align='right' sx={{ padding: '8px' }}>{pago.status}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold', paddingRight: '8px', fontSize: 20 }}>
                                                {isNaN(montoTotal) || montoTotal === null || montoTotal === undefined ? '' : `Monto Total: $${parseFloat(montoTotal).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                    </div>

                </div>
            </div >
        </>
    );
};
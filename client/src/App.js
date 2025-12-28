import './App.css';
import { useState, useEffect, useRef   } from "react";
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

import Swal from 'sweetalert2'
import { ClipLoader } from 'react-spinners';

function App() {
  //Estados para obtener los valores del formulario
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState();
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState();
  const [id, setId] = useState();

  // Estado para manejar la carga
  const [loading, setLoading] = useState(false);

  //Estdo para determinar si estamos en edit o no
  const [editar, setEditar] = useState(false);

  //lista de empleados
  const [empleadosList, setEmpleados] = useState([]);

  // Define una referencia para el contenedor del formulario
  const formRef = useRef(null);

  //Estado para identificar ordenamiento de la tabla. Key indica la columna y direction al dirección
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  //Función para la animación de cargando
  const Loader = () => {
    return (
      <div className="overlay"> {/* Usamos la clase 'overlay' definida en App.css */}
        <ClipLoader color="#3498db" size={100} />
      </div>
    );
  };


  //Metodo para registrar usuarios en la base de datos
  const add = () => {

    setLoading(true);

    Axios.post("http://localhost:3001/create", {
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anios: anios,
    }).then(() => {
      getEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<i>Registro exitoso.</i>",
        html: "<i>El empleado <strong>" + nombre + " </strong>fué registrado correctamente.</i>",
        icon: 'success'
      })
    }).catch((error) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar al usuario",
        icon: "error",
      });
      console.error("Error al registrar el usuario:", error);
    })
    .finally(() => {
      setLoading(false); // Desactivar carga
    });
  };

  //Metodo para actualizar usuarios en la base de datos
  const update = () => {
    Axios.put("http://localhost:3001/update", {
      id: id,
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anios: anios,
    }).then(() => {
      getEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<i>Actualización exitosa.</i>",
        html: "<i>El empleado <strong>" + nombre + " </strong>fué actualizado correctamente.</i>",
        icon: 'success'
      })
    }).catch((error) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el usuario",
        icon: "error",
      });
      console.error("Error al actualizar el usuario:", error);
    });
  };

  //Metodo para eliminar usuarios en la base de datos
  const deleteUser = async (val) => {
    const result = await Swal.fire({
      title: "Eliminar",
      html: `<i>¿Seguro que desea eliminar a <strong>${val.nombre}</strong>?</i>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      reverseButtons: true, // Invierte el orden de los botones
    });

    // Si el usuario presiona "No" o cierra el modal, no hacemos nada
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await Axios.delete(`http://localhost:3001/delete/${val.id}`);
      getEmpleados();
      limpiarCampos();
      setLoading(false); // Apagar loader antes del Swal para no bloquearlo
      await Swal.fire({
        title: "Registro eliminado exitosamente",
        html: `<i>Se ha eliminado el registro de <strong>${val.nombre}</strong> correctamente</i>`,
        icon: "success",
      });
    } catch (error) {
      setLoading(false); // Apagar loader antes del Swal para no bloquearlo
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el usuario",
        icon: "error",
      });
      console.error("Error al eliminar el usuario:", error);
    } finally {
      setLoading(false); // Asegura apagado si algo cambia en el flujo
    }
  };

  const limpiarCampos = () => {

    setEditar(false);

    setNombre("");
    setEdad("");
    setPais("");
    setCargo("");
    setAnios("");
  }

  const editarEmpleado = (val) => {
    setEditar(true);

    setNombre(val.nombre);
    setEdad(val.edad);
    setPais(val.pais);
    setCargo(val.cargo);
    setAnios(val.anios);
    setId(val.id);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  //Metodo para obtener los empleados a través de la API
  const getEmpleados = () => {
    Axios.get("http://localhost:3001/empleados").then((response) => {
      setEmpleados(response.data);
    });
  };

  // Ejecutar getEmpleados cuando el componente se monte
  useEffect(() => {
    getEmpleados(); // Llamar a la función para obtener los empleados al cargar la página
  }, []); // El array vacío asegura que se ejecute solo una vez



  //Función que recibe la columna y determina si al hacer click debe ordenar de forma ascendente o descendente
  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  //Se crea una copia de la lista de empleados 
  const sortedEmpleados = [...empleadosList].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const getSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? " 🔼" : " 🔽";
    }
    return " ⬍";
  };

  return (
    <div className="container">
      {loading && <Loader />} {/* Mostrar el spinner cuando 'loading' sea true */}
      {/* formulario para obtener datos de cliente */}
      <div className="card text-center">
        <div className="card-header" ref={formRef}>
          Gestión de Empleados
        </div>
        <div className="card-body">
          
          {[
            // Array con los datos de cada campo del formulario
            { label: "Nombre", type: "text", state: nombre, setter: setNombre },
            { label: "Edad", type: "number", state: edad, setter: setEdad },
            { label: "País", type: "text", state: pais, setter: setPais },
            { label: "Cargo", type: "text", state: cargo, setter: setCargo },
            { label: "Años", type: "number", state: anios, setter: setAnios },
          ].map(({ label, type, state, setter }) => (
            // Mapeamos el array para generar dinámicamente cada campo del formulario
            <div className="input-group mb-3" key={label}>
              {/* Etiqueta del campo con diseño de Bootstrap */}
              <span className="input-group-text" id={`basic-addon-${label.toLowerCase()}`}>{label}</span>
              <input
                type={type}
                value={state}
                onChange={(event) => setter(event.target.value)} // Actualiza el estado al escribir
                className="form-control"
                placeholder={`Ingrese ${label.toLowerCase()}`}
                aria-label={label}
                aria-describedby={`basic-addon-${label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        <div className="card-footer text-body-secondary">
          {
            //Determinar si estamos en modo editar, y mostrar botones correspondientes
            editar===true ? 
            <div>
              <button className='btn btn-warning m-2' onClick={update}>Actualizar</button>
              <button className='btn btn-info m-2' onClick={limpiarCampos}>Cancelar</button>
            </div>
            :
              <button className='btn btn-success' onClick={add}>Registrar</button>

          }
        </div>
      </div>
      <table className="table table-striped">
      <thead>
      <tr>
        <th scope="col" onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
          # {getSortIcon("id")}
        </th>
        <th scope="col" onClick={() => handleSort("nombre")} style={{ cursor: "pointer" }}>
          Nombre {getSortIcon("nombre")}
        </th>
        <th scope="col" onClick={() => handleSort("edad")} style={{ cursor: "pointer" }}>
          Edad {getSortIcon("edad")}
        </th>
        <th scope="col" onClick={() => handleSort("pais")} style={{ cursor: "pointer" }}>
          País {getSortIcon("pais")}
        </th>
        <th scope="col" onClick={() => handleSort("cargo")} style={{ cursor: "pointer" }}>
          Cargo {getSortIcon("cargo")}
        </th>
        <th scope="col" onClick={() => handleSort("anios")} style={{ cursor: "pointer" }}>
          Experiencia {getSortIcon("anios")}
        </th>
        <th scope="col">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {sortedEmpleados.map((val) => (
        <tr key={val.id}>
          <th scope="row">{val.id}</th>
          <td>{val.nombre}</td>
          <td>{val.edad}</td>
          <td>{val.pais}</td>
          <td>{val.cargo}</td>
          <td>{val.anios}</td>
          <td>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button type="button" onClick={() => editarEmpleado(val)} className="btn btn-info">
                Editar
              </button>
              <button type="button" onClick={() => deleteUser(val)} className="btn btn-danger">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
      </table>
    </div>
  );
}

export default App;

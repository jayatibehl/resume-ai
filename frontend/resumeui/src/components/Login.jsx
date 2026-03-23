import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {

  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate"
  });

  const submit = async () => {

    const url = isRegister
      ? "http://127.0.0.1:5000/api/register"
      : "http://127.0.0.1:5000/api/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      // REGISTER FLOW
      if (isRegister) {
        if (data.message) {
          alert("Account created successfully. Please login.");
          setIsRegister(false);
        } else {
          alert(data.error || "Registration failed");
        }
        return;
      }

      // LOGIN FLOW
      if (data.role) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);

        if (data.role === "candidate") {
          navigate("/candidate");
        } else {
          navigate("/recruiter");
        }

      } else {
        alert(data.error || "Invalid login");
      }

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <p className="subtitle">
          {isRegister
            ? "Create your ResumeAI account"
            : "Login to access your dashboard"}
        </p>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* ✅ FORGOT PASSWORD */}
        {!isRegister && (
          <p
            style={{
              textAlign: "right",
              marginTop: "6px",
              fontSize: "14px",
              color: "#5b6cff",
              cursor: "pointer"
            }}
            onClick={() => alert("Forgot password feature coming soon")}
          >
            Forgot Password?
          </p>
        )}

        {isRegister && (
          <select
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        )}

        <button className="primary-btn" onClick={submit}>
          {isRegister ? "Create Account" : "Login"}
        </button>

        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "New here?"}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? " Login" : " Create Account"}
          </span>
        </p>

      </div>
    </div>
  );
}
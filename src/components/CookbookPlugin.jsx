import { createClient } from "@remixproject/plugin-webview";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "universal-cookie";
// import { useUserConsumer } from "../contexts/User/User";
// import track from "../utils/mixpanel/track";
import Logo from "../logo.svg";
import { CookbookRemixClient } from "./CookbookRemixClient.tsx";
export const client = new CookbookRemixClient();

createClient(client);

const ContractCard = ({ contract, theme }) => {
  // const { userData } = useUserConsumer();
  const [opening, setOpening] = useState(false);

  return (
    <Card
      key={contract.address}
      className="card mb-2 hover-overlay"
      theme={theme}
    >
      <div className="card-body">
        <div
          style={{ marginBottom: "20px" }}
          onClick={() => {
            setOpening(true);
            // track(
            //   "Remix: contract opened",
            //   { contract: contract.address },
            //   userData
            // );
            client.openContract(contract.address).then(() => {
              setTimeout(() => {
                setOpening(false);
              }, 1000);
            });
          }}
        >
          <h6 className="card-title" style={{ lineHeight: "1.4" }}>
            {contract.name} ({contract.author})
          </h6>

          <p className="card-text text-muted">{contract.simpleDescription}</p>
        </div>
        <a
          onClick={(e) => {
            e.stopPropagation();
            // track(
            //   "Remix: open cookbook",
            //   { contract: contract.address },
            //   userData
            // );
          }}
          href={`https://www.cookbook.dev/contracts/${contract.address}?utm=remix`}
          target="_blank"
          rel="noreferrer noopener"
          style={{ fontSize: "small" }}
        >
          View Docs and Stats
        </a>
        {opening && <div>Opening...</div>}
      </div>
    </Card>
  );
};

export const CookbookPlugin = () => {
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  // const { userData } = useUserConsumer();

  const getContracts = useCallback(async () => {
    const res = await axios.post("/contracts/search", {
      search,
      sort: "popular",
      filter: "",
      page: 1,
      typeahead: true,
    });
    // track("Remix: search", { query: search }, userData);
    setContracts(res.data.contracts);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    let cookies = new Cookies();
    let installed = cookies.get("plugin-installed");
    if (!installed) {
      cookies.set("plugin-installed", "true");
      // track("Remix: Plugin Installed", {}, userData);
    }
    client.on("theme", "themeChanged", (theme) => {
      setTheme(theme?.quality ?? "dark");
    });
  }, []);

  useEffect(() => {
    const debounceSearch = setTimeout(async () => {
      try {
        getContracts();
      } catch (error) {
        console.error(error);
      }
    }, 200); // debounce time in milliseconds

    return () => clearTimeout(debounceSearch);
  }, [getContracts]);

  return (
    <div className="p-3">
      <div>
        <a
          href="https://www.cookbook.dev?utm=remix"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            textDecoration: "none",
            marginBottom: "16px",
            color: theme === "light" ? "black" : "white",
          }}
        >
          <img src={Logo} width={50} height={50} alt="Cookbook logo" />
          <div
            style={{
              fontSize: "x-large",
              fontWeight: "bold",
              alignSelf: "flex-end",
            }}
          >
            Cookbook.dev
          </div>
        </a>
      </div>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="inputGroup-sizing-default">
            Search
          </span>
        </div>
        <input
          type="text"
          class="form-control"
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          onChange={(e) => {
            setSearch(e.target.value);
            setLoading(true);
          }}
          value={search}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : Boolean(contracts.length) ? (
        contracts.map((contract) => (
          <ContractCard
            key={contract.address}
            contract={contract}
            theme={theme}
          />
        ))
      ) : (
        <div>No contracts found</div>
      )}
    </div>
  );
};

const Card = styled.div`
  transition: all 0.1s linear;
  cursor: pointer;
  :hover {
    background-color: ${({ theme }) =>
      theme === "light" ? "#e5e8ea" : "#5d5f70"};
  }
`;

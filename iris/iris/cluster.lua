-- Iris domain clustering for thematic grouping
-- Usage: local cluster = require("iris.cluster")

local M = {}

-- Extract domain signals from a session
-- Returns table of domain hints with weights
function M.extract_domains(session)
    local domains = {}
    local function add(domain, weight)
        domains[domain] = (domains[domain] or 0) + (weight or 1)
    end

    for _, turn in ipairs(session.turns or {}) do
        for _, msg in ipairs(turn.messages or {}) do
            for _, block in ipairs(msg.content or {}) do
                -- Tool usage patterns
                if block.type == "tool_use" then
                    local name = block.name or ""
                    local input = block.input or {}

                    -- File paths reveal domain
                    local path = input.path or input.file_path or input.file or ""
                    if path ~= "" then
                        -- Extract directory components
                        for dir in path:gmatch("/([^/]+)/") do
                            if not dir:match("^%.") then  -- Skip hidden dirs
                                add(dir, 0.5)
                            end
                        end
                        -- File extensions
                        local ext = path:match("%.([^%.]+)$")
                        if ext then
                            add("file:" .. ext, 0.3)
                        end
                    end

                    -- Tool names
                    if name:match("test") or name:match("Test") then
                        add("testing", 1)
                    elseif name:match("git") or name:match("Git") then
                        add("git", 0.5)
                    elseif name:match("build") or name:match("Build") then
                        add("build", 1)
                    end

                    -- Command content for Bash
                    local cmd = input.command or ""
                    if cmd:match("test") or cmd:match("cargo test") or cmd:match("npm test") then
                        add("testing", 1.5)
                    elseif cmd:match("git") then
                        add("git", 0.5)
                    elseif cmd:match("build") or cmd:match("cargo build") or cmd:match("npm run build") then
                        add("build", 1)
                    end
                end

                -- Text content keywords
                if block.type == "text" and block.text then
                    local text = block.text:lower()

                    -- Common domain keywords
                    local keywords = {
                        {"auth", "authentication", 1.5},
                        {"login", "authentication", 1},
                        {"api", "api", 1},
                        {"endpoint", "api", 0.8},
                        {"database", "database", 1.5},
                        {"sql", "database", 1},
                        {"query", "database", 0.5},
                        {"test", "testing", 1},
                        {"spec", "testing", 0.8},
                        {"ui", "frontend", 1},
                        {"component", "frontend", 0.8},
                        {"style", "frontend", 0.5},
                        {"css", "frontend", 1},
                        {"refactor", "refactoring", 1.5},
                        {"cleanup", "refactoring", 1},
                        {"bug", "bugfix", 1.5},
                        {"fix", "bugfix", 1},
                        {"error", "bugfix", 0.8},
                        {"feature", "feature", 1},
                        {"implement", "feature", 0.8},
                        {"add", "feature", 0.3},
                        {"doc", "documentation", 1},
                        {"readme", "documentation", 1},
                        {"comment", "documentation", 0.5},
                        {"config", "configuration", 1},
                        {"setup", "configuration", 0.8},
                        {"deploy", "deployment", 1.5},
                        {"ci", "deployment", 1},
                        {"performance", "performance", 1.5},
                        {"optim", "performance", 1},
                        {"slow", "performance", 0.8},
                    }

                    for _, kw in ipairs(keywords) do
                        if text:match(kw[1]) then
                            add(kw[2], kw[3])
                        end
                    end
                end
            end
        end
    end

    return domains
end

-- Get the primary domain(s) for a session
-- Returns array of {domain, weight} sorted by weight
function M.primary_domains(session, max_domains)
    max_domains = max_domains or 3

    local domains = M.extract_domains(session)

    -- Convert to array and sort by weight
    local sorted = {}
    for domain, weight in pairs(domains) do
        -- Filter out low-signal domains
        if weight >= 1 and not domain:match("^file:") then
            table.insert(sorted, {domain = domain, weight = weight})
        end
    end

    table.sort(sorted, function(a, b) return a.weight > b.weight end)

    -- Return top N
    local result = {}
    for i = 1, math.min(max_domains, #sorted) do
        table.insert(result, sorted[i])
    end

    return result
end

-- Cluster multiple sessions by domain
-- Returns table: domain -> array of sessions
function M.cluster_sessions(sessions)
    local clusters = {}

    for _, session in ipairs(sessions) do
        local domains = M.primary_domains(session, 2)

        if #domains == 0 then
            -- No clear domain, put in "general"
            clusters["general"] = clusters["general"] or {}
            table.insert(clusters["general"], session)
        else
            -- Add to primary domain
            local primary = domains[1].domain
            clusters[primary] = clusters[primary] or {}
            table.insert(clusters[primary], session)
        end
    end

    return clusters
end

-- Get cluster statistics
function M.cluster_stats(clusters)
    local stats = {}
    local total = 0

    for domain, sessions in pairs(clusters) do
        stats[domain] = #sessions
        total = total + #sessions
    end

    return {
        clusters = stats,
        total_sessions = total,
        cluster_count = 0,  -- Will be set below
    }
end

-- Format clusters for display
function M.format_clusters(clusters)
    local lines = {}

    -- Sort by cluster size
    local sorted = {}
    for domain, sessions in pairs(clusters) do
        table.insert(sorted, {domain = domain, count = #sessions})
    end
    table.sort(sorted, function(a, b) return a.count > b.count end)

    table.insert(lines, string.format("Found %d domain clusters:", #sorted))
    for _, c in ipairs(sorted) do
        table.insert(lines, string.format("  %s: %d sessions", c.domain, c.count))
    end

    return table.concat(lines, "\n")
end

-- Predefined domain descriptions for prompts
M.DOMAIN_CONTEXT = {
    authentication = "authentication, login flows, and security",
    api = "API design, endpoints, and integration",
    database = "database operations, queries, and data modeling",
    testing = "testing, test coverage, and quality assurance",
    frontend = "UI components, styling, and user experience",
    refactoring = "code refactoring and cleanup",
    bugfix = "bug fixes and error resolution",
    feature = "new feature implementation",
    documentation = "documentation and code comments",
    configuration = "configuration and setup",
    deployment = "deployment, CI/CD, and infrastructure",
    performance = "performance optimization",
    general = "various development tasks",
}

-- Get context string for a domain
function M.domain_context(domain)
    return M.DOMAIN_CONTEXT[domain] or domain
end

return M

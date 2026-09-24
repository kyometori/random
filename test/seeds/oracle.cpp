#include "../engines.hpp"

#include <cstdint>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

std::int64_t parse_i64(const std::string& value) {
  std::size_t consumed = 0;
  const auto result = std::stoll(value, &consumed, 0);

  if (consumed != value.size()) {
    throw std::runtime_error("invalid int64: " + value);
  }

  return result;
}

std::vector<std::int64_t> read_seed(std::size_t count) {
  std::vector<std::int64_t> seed;
  seed.reserve(count);

  for (std::size_t i = 0; i < count; ++i) {
    std::string value;

    if (!(std::cin >> value)) {
      throw std::runtime_error("missing seed value");
    }

    seed.push_back(parse_i64(value));
  }

  return seed;
}

template <typename Fn>
void with_seed_sequence(std::size_t seed_count, Fn&& fn) {
  const auto seed = read_seed(seed_count);
  std::seed_seq seq(seed.begin(), seed.end());

  fn(seq);
}

void run_seedseq_values(std::size_t seed_count, std::size_t count) {
  with_seed_sequence(seed_count, [&]<typename Sseq>(Sseq& seq) {
    std::vector<std::uint32_t> output(count);

    seq.generate(output.begin(), output.end());

    for (const auto value : output) {
      std::cout << value << '\n';
    }
  });
}

void run_seedseq_digest(std::size_t seed_count, std::size_t count) {
  with_seed_sequence(seed_count, [&]<typename Sseq>(Sseq& seq) {
    std::vector<std::uint32_t> output(count);

    seq.generate(output.begin(), output.end());

    std::uint64_t hash = 14695981039346656037ull;
    std::uint64_t sum = 0;
    std::uint64_t xors = 0;

    for (const auto value : output) {
      sum += value;
      xors ^= value;

      const auto input = static_cast<std::uint64_t>(value);

      for (unsigned byte = 0; byte < 4; ++byte) {
        const auto chunk = (input >> (byte * 8u)) & 0xffu;

        hash ^= chunk;
        hash *= 1099511628211ull;
      }
    }

    std::cout << hash << ' ' << sum << ' ' << xors << '\n';
  });
}

void run_engine_values(const std::string& engine_name, std::size_t seed_count, std::uint64_t discard, std::size_t count) {
  with_seed_sequence(seed_count, [&]<typename Sseq>(Sseq& seq) {
    const bool found = with_engine(engine_name, [&]<typename Engine>() {
      Engine engine(seq);
      engine.discard(discard);

      for (std::size_t i = 0; i < count; ++i) {
        std::cout << engine() << '\n';
      }
    });

    if (!found) {
      throw std::runtime_error("unknown engine: " + engine_name);
    }
  });
}

void run_engine_digest(const std::string& engine_name, std::size_t seed_count, std::uint64_t discard, std::size_t count) {
  with_seed_sequence(seed_count, [&]<typename Sseq>(Sseq& seq) {
    const bool found = with_engine(engine_name, [&]<typename Engine>() {
      Engine engine(seq);
      engine.discard(discard);

      std::uint64_t hash = 14695981039346656037ull;
      std::uint64_t sum = 0;
      std::uint64_t xors = 0;

      for (std::size_t i = 0; i < count; ++i) {
        const auto value = static_cast<std::uint64_t>(engine());

        sum += value;
        xors ^= value;

        for (unsigned byte = 0; byte < 8; ++byte) {
          const auto chunk = (value >> (byte * 8u)) & 0xffu;

          hash ^= chunk;
          hash *= 1099511628211ull;
        }
      }

      std::cout << hash << ' ' << sum << ' ' << xors << '\n';
    });

    if (!found) {
      throw std::runtime_error("unknown engine: " + engine_name);
    }
  });
}

int main() {
  std::string command;

  while (std::cin >> command) {
    try {
      if (command == "seedseq-values") {
        std::size_t seed_count;
        std::size_t count;

        std::cin >> seed_count >> count;
        run_seedseq_values(seed_count, count);
      } else if (command == "seedseq-digest") {
        std::size_t seed_count;
        std::size_t count;

        std::cin >> seed_count >> count;
        run_seedseq_digest(seed_count, count);
      } else if (command == "engine-values") {
        std::string engine_name;
        std::size_t seed_count;
        std::uint64_t discard;
        std::size_t count;

        std::cin >> engine_name >> seed_count >> discard >> count;
        run_engine_values(engine_name, seed_count, discard, count);
      } else if (command == "engine-digest") {
        std::string engine_name;
        std::size_t seed_count;
        std::uint64_t discard;
        std::size_t count;

        std::cin >> engine_name >> seed_count >> discard >> count;
        run_engine_digest(engine_name, seed_count, discard, count);
      } else {
        throw std::runtime_error("unknown command: " + command);
      }

      std::cout << "END" << std::endl;
    } catch (const std::exception& error) {
      std::cerr << "oracle error: " << error.what() << '\n';
      return 1;
    }
  }

  return 0;
}

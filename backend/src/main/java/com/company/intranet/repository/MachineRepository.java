package com.company.intranet.repository;

import com.company.intranet.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByCompletedTrue();
    boolean existsByBlockNo(Integer blockNo);
    // New helper: check if a block is used by any non-completed machine
    boolean existsByBlockNoAndCompletedFalse(Integer blockNo);
}

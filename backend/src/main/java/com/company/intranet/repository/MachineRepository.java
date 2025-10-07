package com.company.intranet.repository;

import com.company.intranet.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByCompletedTrue();
    boolean existsByBlockNo(Integer blockNo);
}
